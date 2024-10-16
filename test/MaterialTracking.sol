// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MaterialTracking {
    // Enum to represent the shipment status
    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED }

    // Struct to store details of each material shipment
    struct MaterialShipment {
        address supplier;
        address contractor;
        string materialType;
        uint256 quantity; // Quantity of construction material
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    // Mapping from supplier's address to their list of shipments
    mapping(address => MaterialShipment[]) public shipments;
    uint256 public shipmentCount;

    // Array to keep a record of all shipments
    MaterialShipment[] public allShipments;

    // Events to log important actions in the contract
    event ShipmentCreated(
        address indexed supplier,
        address indexed contractor,
        string materialType,
        uint256 quantity,
        uint256 pickupTime,
        uint256 distance,
        uint256 price
    );
    event ShipmentInTransit(address indexed supplier, address indexed contractor, uint256 pickupTime);
    event ShipmentDelivered(address indexed supplier, address indexed contractor, uint256 deliveryTime);
    event ShipmentPaid(address indexed supplier, address indexed contractor, uint256 amount);

    constructor() {
        shipmentCount = 0;
    }

    // Function to create a new material shipment
    function createMaterialShipment(
        address _contractor,
        string memory _materialType,
        uint256 _quantity,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _price
    ) public payable {
        require(msg.value == _price, "Payment amount must match the price.");

        MaterialShipment memory newShipment = MaterialShipment(
            msg.sender, // supplier
            _contractor,
            _materialType,
            _quantity,
            _pickupTime,
            0, // Delivery time is 0 when created
            _distance,
            _price,
            ShipmentStatus.PENDING,
            false
        );

        shipments[msg.sender].push(newShipment);
        shipmentCount++;

        allShipments.push(newShipment);

        emit ShipmentCreated(msg.sender, _contractor, _materialType, _quantity, _pickupTime, _distance, _price);
    }

    // Function to mark a shipment as "In Transit"
    function startMaterialShipment(address _supplier, address _contractor, uint256 _index) public {
        MaterialShipment storage shipment = shipments[_supplier][_index];

        require(shipment.contractor == _contractor, "Invalid contractor.");
        require(shipment.status == ShipmentStatus.PENDING, "Shipment is already in transit.");

        shipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(_supplier, _contractor, shipment.pickupTime);
    }

    // Function to complete a shipment and transfer payment
    function completeMaterialShipment(address _supplier, address _contractor, uint256 _index) public {
        MaterialShipment storage shipment = shipments[_supplier][_index];

        require(shipment.contractor == _contractor, "Invalid contractor.");
        require(shipment.status == ShipmentStatus.IN_TRANSIT, "Shipment is not in transit.");
        require(!shipment.isPaid, "Shipment is already paid.");

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveryTime = block.timestamp;

        uint256 amount = shipment.price;
        payable(_supplier).transfer(amount);

        shipment.isPaid = true;

        emit ShipmentDelivered(_supplier, _contractor, shipment.deliveryTime);
        emit ShipmentPaid(_supplier, _contractor, amount);
    }

    // Function to get details of a specific material shipment
    function getMaterialShipment(address _supplier, uint256 _index) public view returns (
        address, address, string memory, uint256, uint256, uint256, uint256, uint256, ShipmentStatus, bool
    ) {
        MaterialShipment memory shipment = shipments[_supplier][_index];
        return (
            shipment.supplier,
            shipment.contractor,
            shipment.materialType,
            shipment.quantity,
            shipment.pickupTime,
            shipment.deliveryTime,
            shipment.distance,
            shipment.price,
            shipment.status,
            shipment.isPaid
        );
    }


    // Function to get the total number of shipments for a supplier
    function getMaterialShipmentsCount(address _supplier) public view returns (uint256) {
        return shipments[_supplier].length;
    }

    // Function to get all material shipment transactions
    function getAllMaterialTransactions() public view returns (MaterialShipment[] memory) {
        return allShipments;
    }
}
