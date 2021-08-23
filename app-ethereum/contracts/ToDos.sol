pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

contract Todos {
  string[] public todos;

  constructor() payable {
  }

  function add(string memory todo) public payable {
    todos.push(todo);
  }

  function get() public view returns (string[] memory) {
    return todos;
  }
}
