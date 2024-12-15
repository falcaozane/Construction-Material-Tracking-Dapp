// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MaterialTracking {
    // Enum to represent the shipment status
    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED }

    // Struct to store transaction details
    struct Transaction {
        bytes32 transactionHash;
        uint256 timestamp;
        string actionType; // "CREATE", "START", "COMPLETE"
    }

    // Struct to store details of each material shipment
    struct MaterialShipment {
        address supplier;
        address contractor;
        string materialType;
        uint256 quantity;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
        Transaction[] transactions; // Array to store transaction history
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
        uint256 price,
        bytes32 transactionHash
    );

    event ShipmentInTransit(
        address indexed supplier,
        address indexed contractor,
        uint256 pickupTime,
        bytes32 transactionHash
    );

    event ShipmentDelivered(
        address indexed supplier,
        address indexed contractor,
        uint256 deliveryTime,
        bytes32 transactionHash
    );

    event ShipmentPaid(
        address indexed supplier,
        address indexed contractor,
        uint256 amount,
        bytes32 transactionHash
    );

    event TransactionRecorded(
        address indexed supplier,
        uint256 indexed shipmentIndex,
        bytes32 transactionHash,
        string actionType
    );

    constructor() {
        shipmentCount = 0;
    }

    // Internal function to record transaction
    function _recordTransaction(
        MaterialShipment storage shipment,
        address supplier,
        uint256 shipmentIndex,
        string memory actionType
    ) internal {
        bytes32 txHash = bytes32(uint256(uint160(tx.origin)) << 96 | uint256(block.number));
        Transaction memory newTransaction = Transaction({
            transactionHash: txHash,
            timestamp: block.timestamp,
            actionType: actionType
        });
        
        shipment.transactions.push(newTransaction);
        
        emit TransactionRecorded(
            supplier,
            shipmentIndex,
            txHash,
            actionType
        );
    }

    function createMaterialShipment(
        address _contractor,
        string memory _materialType,
        uint256 _quantity,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _price
    ) public payable {
        require(msg.value == _price, "Payment amount must match the price.");

        MaterialShipment memory newShipment = MaterialShipment({
            supplier: msg.sender,
            contractor: _contractor,
            materialType: _materialType,
            quantity: _quantity,
            pickupTime: _pickupTime,
            deliveryTime: 0,
            distance: _distance,
            price: _price,
            status: ShipmentStatus.PENDING,
            isPaid: false,
            transactions: new Transaction[](0)
        });

        shipments[msg.sender].push(newShipment);
        uint256 shipmentIndex = shipments[msg.sender].length - 1;
        
        // Record the transaction
        _recordTransaction(
            shipments[msg.sender][shipmentIndex],
            msg.sender,
            shipmentIndex,
            "CREATE"
        );

        shipmentCount++;
        allShipments.push(newShipment);

        emit ShipmentCreated(
            msg.sender,
            _contractor,
            _materialType,
            _quantity,
            _pickupTime,
            _distance,
            _price,
            shipments[msg.sender][shipmentIndex].transactions[0].transactionHash
        );
    }

    function startMaterialShipment(address _supplier, address _contractor, uint256 _index) public {
        MaterialShipment storage shipment = shipments[_supplier][_index];

        require(shipment.contractor == _contractor, "Invalid contractor.");
        require(shipment.status == ShipmentStatus.PENDING, "Shipment is already in transit.");

        shipment.status = ShipmentStatus.IN_TRANSIT;
        
        // Record the transaction
        _recordTransaction(
            shipment,
            _supplier,
            _index,
            "START"
        );

        emit ShipmentInTransit(
            _supplier,
            _contractor,
            shipment.pickupTime,
            shipment.transactions[shipment.transactions.length - 1].transactionHash
        );
    }

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

        // Record the transaction
        _recordTransaction(
            shipment,
            _supplier,
            _index,
            "COMPLETE"
        );

        bytes32 latestTxHash = shipment.transactions[shipment.transactions.length - 1].transactionHash;
        
        emit ShipmentDelivered(_supplier, _contractor, shipment.deliveryTime, latestTxHash);
        emit ShipmentPaid(_supplier, _contractor, amount, latestTxHash);
    }

    function getMaterialShipment(address _supplier, uint256 _index) public view returns (
        address supplier,
        address contractor,
        string memory materialType,
        uint256 quantity,
        uint256 pickupTime,
        uint256 deliveryTime,
        uint256 distance,
        uint256 price,
        ShipmentStatus status,
        bool isPaid,
        Transaction[] memory transactions
    ) {
        MaterialShipment storage shipment = shipments[_supplier][_index];
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
            shipment.isPaid,
            shipment.transactions
        );
    }

    function getMaterialShipmentsCount(address _supplier) public view returns (uint256) {
        return shipments[_supplier].length;
    }

    function getAllMaterialTransactions() public view returns (MaterialShipment[] memory) {
        return allShipments;
    }
}