// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DomainIntelligence {
    struct DomainScore {
        string domain;
        uint256 aiScore;
        uint256 marketScore;
        uint256 timestamp;
        address scorer;
        bool verified;
    }
    
    struct CommunityRating {
        address rater;
        uint256 rating;
        string comment;
        uint256 timestamp;
    }
    
    address public owner;
    mapping(string => DomainScore) public domainScores;
    mapping(string => CommunityRating[]) public communityRatings;
    mapping(address => bool) public authorizedScorers;
    mapping(address => uint256) public userReputationScores;
    
    event DomainScored(string indexed domain, uint256 aiScore, uint256 marketScore, address scorer);
    event CommunityRated(string indexed domain, address rater, uint256 rating);
    event ReputationUpdated(address user, uint256 newScore);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedScorer() {
        require(authorizedScorers[msg.sender], "Not authorized scorer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedScorers[msg.sender] = true;
    }
    
    function scoreDomain(
        string memory domain,
        uint256 aiScore,
        uint256 marketScore
    ) external onlyAuthorizedScorer {
        require(aiScore <= 100 && marketScore <= 100, "Scores must be <= 100");
        
        domainScores[domain] = DomainScore({
            domain: domain,
            aiScore: aiScore,
            marketScore: marketScore,
            timestamp: block.timestamp,
            scorer: msg.sender,
            verified: true
        });
        
        emit DomainScored(domain, aiScore, marketScore, msg.sender);
    }
    
    function addCommunityRating(
        string memory domain,
        uint256 rating,
        string memory comment
    ) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(userReputationScores[msg.sender] >= 10, "Minimum reputation required");
        
        communityRatings[domain].push(CommunityRating({
            rater: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp
        }));
        
        userReputationScores[msg.sender] += 1;
        
        emit CommunityRated(domain, msg.sender, rating);
        emit ReputationUpdated(msg.sender, userReputationScores[msg.sender]);
    }
    
    function getDomainScore(string memory domain) 
        external 
        view 
        returns (DomainScore memory) 
    {
        return domainScores[domain];
    }
    
    function getCommunityRatingsCount(string memory domain) 
        external 
        view 
        returns (uint256) 
    {
        return communityRatings[domain].length;
    }
    
    function getCommunityRating(string memory domain, uint256 index) 
        external 
        view 
        returns (CommunityRating memory) 
    {
        require(index < communityRatings[domain].length, "Index out of bounds");
        return communityRatings[domain][index];
    }
    
    function addAuthorizedScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = true;
    }
    
    function removeAuthorizedScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = false;
    }
    
    function bootstrapUserReputation(address user, uint256 score) external onlyOwner {
        userReputationScores[user] = score;
        emit ReputationUpdated(user, score);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}