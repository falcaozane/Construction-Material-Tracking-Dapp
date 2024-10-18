// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MaterialPoSVerification {
    struct Material {
        string batchID;           // Batch or material ID
        string materialType;      // Type of material (e.g., cement, steel, etc.)
        string supplier;          // Supplier name or ID
        uint256 quantity;         // Quantity of material
        address owner;            // Owner of the material
        bool qualityChecked;      // Whether quality has been finalized
        bool pass;                // Result of consensus (pass/fail)
        uint256 stake;            // Total staked amount by validators
    }

    mapping(string => Material) public materials;  // Mapping of batchID to Material data
    mapping(address => uint256) public stakes;     // Validator stakes

    uint256 public minimumStake = 1 ether;         // Minimum stake required for validation
    uint256 public penalty = 0.5 ether;            // Penalty for false endorsement
    uint256 public stakeThreshold = 5 ether;       // Threshold for consensus
    address public verifier;                       // Admin who deploys the contract

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can perform this action.");
        _;
    }

    constructor() {
        verifier = msg.sender;  // Initial verifier (e.g., contract deployer)
    }

    // Function to add a new material batch, only by verifier
    function addMaterial(
        string memory _batchID, 
        string memory _materialType, 
        string memory _supplier, 
        uint256 _quantity, 
        address _owner
    ) public onlyVerifier {
        require(materials[_batchID].owner == address(0), "Material already exists.");

        materials[_batchID] = Material({
            batchID: _batchID,
            materialType: _materialType,
            supplier: _supplier,
            quantity: _quantity,
            owner: _owner,
            qualityChecked: false,
            pass: false,
            stake: 0
        });
    }

    // Validators can stake tokens and endorse material quality
    function stakeAndValidate(string memory _batchID, bool approve) public payable {
        Material storage material = materials[_batchID];
        require(material.owner != address(0), "Material not found.");
        require(!material.qualityChecked, "Material quality already checked.");
        require(msg.value >= minimumStake, "Insufficient stake.");

        // Validators stake their funds to validate material
        stakes[msg.sender] += msg.value;
        material.stake += msg.value;

        // If enough stake is gathered, finalize quality based on majority
        if (material.stake >= stakeThreshold) {  // Threshold for consensus
            material.qualityChecked = true;
            material.pass = approve;
        }
    }

    // Function to verify material quality after consensus
    function verifyMaterial(string memory _batchID) public view returns (
        string memory materialType, 
        string memory supplier, 
        uint256 quantity, 
        address owner, 
        bool qualityChecked, 
        bool pass
    ) {
        Material memory material = materials[_batchID];
        require(material.owner != address(0), "Material not found.");
        return (material.materialType, material.supplier, material.quantity, material.owner, material.qualityChecked, material.pass);
    }

    // Dispute function in case of incorrect validation (handled by verifier)
    function disputeMaterial(string memory _batchID) public onlyVerifier {
        Material storage material = materials[_batchID];
        require(material.qualityChecked, "Material quality not finalized.");
        material.pass = false;  // Dispute results in failure

        // Penalize validators who falsely staked
        material.stake -= penalty;
        stakes[verifier] += penalty;  // Verifier collects penalty
    }
}
