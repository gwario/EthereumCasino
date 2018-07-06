module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
    networks: {
        ganache: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*"
        },
        production: { //course network
            host: "127.0.0.1",
            port: 8545,
            network_id: "19010311" // Match any network id
        }
    }
};