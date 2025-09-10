async function main() {
    console.log("Deploying DomainIntelligence contract...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    const DomainIntelligence = await ethers.getContractFactory("DomainIntelligence");
    const domainIntelligence = await DomainIntelligence.deploy();

    await domainIntelligence.waitForDeployment();
    const address = await domainIntelligence.getAddress();

    console.log("DomainIntelligence deployed to:", address);

    // Verify deployment
    const owner = await domainIntelligence.owner();
    console.log("Contract owner:", owner);

    // Bootstrap some test data
    console.log("Bootstrapping test data...");

    try {
        // Add a test domain score
        await domainIntelligence.scoreDomain("crypto.ai", 95, 88);
        console.log("Added test domain score for crypto.ai");

        // Bootstrap reputation for deployer
        await domainIntelligence.bootstrapUserReputation(deployer.address, 50);
        console.log("Bootstrapped reputation for deployer");

    } catch (error) {
        console.log("Test data setup failed:", error.message);
    }

    console.log("Deployment completed successfully!");

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        address: address,
        deployer: deployer.address,
        network: "sepolia",
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });