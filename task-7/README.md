## Task Submission
1. Screenshots or video of your application running on Godwoken

![Alt text](https://github.com/leomanza/nervos-hackathon/blob/master/task-7/app_running.gif)

2. Link to the GitHub repository with your application which has been ported to Godwoken. 

https://github.com/leomanza/nervos-hackathon/app-on-godwoken

3. Smart Contract deployed 
    3.1. transaction hash of the deployment transaction: 
        0x8b6b0d8898dd80b21bf0d69806e268532b7d12175d5d2d93e176de5448be6c2e
    3.2. the deployed contract address
        0x5930777d2be36806522d799a5469bd81776a43A8
    3.3. ABI of the deployed smart contract
    [
    {
      "inputs": [],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "todos",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "todo",
          "type": "string"
        }
      ],
      "name": "add",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]