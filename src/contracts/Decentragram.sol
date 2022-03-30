// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

contract Decentragram {
    string public name = "Decentragram";
    uint256 public couter = 0;
    mapping(uint256 => Image) public images;

    struct Image {
        uint256 id;
        string linkIpfs;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint256 id,
        string linkIpfs,
        string description,
        uint256 tipAmount,
        address payable author
    );

    event ImageTipped(
        uint256 id,
        string linkIpfs,
        string description,
        uint256 tipAmount,
        address payable author
    );

    // create image
    function uploadImage(string memory _linkIpfs, string memory _description)
        public
    {
        require(bytes(_linkIpfs).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0x0));

        couter++;
        images[couter] = Image(
            couter,
            _linkIpfs,
            _description,
            0,
            payable(msg.sender)
        );

        emit ImageCreated(
            couter,
            _linkIpfs,
            _description,
            0,
            payable(msg.sender)
        );
    }

    // tip images
    function tipImageOwner(uint256 _id) public payable {
        require(_id > 0 && _id <= couter);

        Image memory _image = images[_id];
        address payable _author = _image.author;
        _author.transfer(msg.value);
        _image.tipAmount = _image.tipAmount + msg.value;

        images[_id] = _image;
        emit ImageTipped(
            _id,
            _image.linkIpfs,
            _image.description,
            _image.tipAmount,
            _author
        );
    }
}
