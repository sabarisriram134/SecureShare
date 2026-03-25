// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SecureShare {
    struct FileRecord {
        string cid;
        address owner;
    }

    mapping(string => FileRecord) public files;
    mapping(string => mapping(address => bool)) public access;

    event FileRegistered(string cid, address owner);
    event AccessGranted(string cid, address recipient);

    // Register file CID
    function registerFile(string memory cid) public {
        files[cid] = FileRecord(cid, msg.sender);
        emit FileRegistered(cid, msg.sender);
    }

    // Grant access
    function grantAccess(string memory cid, address recipient) public {
        require(files[cid].owner == msg.sender, "Only owner");
        access[cid][recipient] = true;
        emit AccessGranted(cid, recipient);
    }

    // Check access
    function hasAccess(string memory cid, address user) public view returns (bool) {
        if (files[cid].owner == user) return true;
        return access[cid][user];
    }
}
