pragma solidity ^0.5.0;

contract Decentragram {
    string public name = "Decentragram";

    //Stores Images
    uint256 public imageCount = 0;
    mapping(uint256 => Image) public images;
    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    event ImageTipped(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    //Create Image
    function uploadImage(string memory _imghash, string memory _description) public{
        //Make sure image hash exists
        require(bytes(_imghash).length > 0);

        //make sure image description exists
        require(bytes(_description).length > 0);

        //Make sure uploader address exists
        require((msg.sender != address(0*0)));

        imageCount ++;
        images[imageCount] = Image(imageCount,_imghash,_description, 0, msg.sender); // address of user who called contract

        emit ImageCreated(imageCount, _imghash, _description, 0, msg.sender); //trigger an event

    }
  function tipImageOwner(uint _id) public payable {
    // Make sure the id is valid
    require(_id > 0 && _id <= imageCount);
    // Fetch the image
    Image memory _image = images[_id];
    // Fetch the author
    address payable _author = _image.author;
    // Pay the author by sending them Ether
    address(_author).transfer(msg.value);
    // Increment the tip amount
    _image.tipAmount = _image.tipAmount + msg.value;
    // Update the image
    images[_id] = _image;
    // Trigger an event
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }
}
