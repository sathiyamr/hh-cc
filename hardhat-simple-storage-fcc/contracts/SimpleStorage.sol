// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract SimpleStorage {
    uint favoriteNumber;

    People[] public people;

    mapping(string => uint256) public nameToFavoriteNumber;

    struct People {
        uint256 favoriteNumber;
        string name;
    }

    function store(uint256 _fvn) public {
        favoriteNumber = _fvn;
    }

    function retrieve() public view returns (uint) {
        return favoriteNumber;
    }

    function addPeople(uint256 _favoriteNumber, string memory _name) public {
        people.push(People({favoriteNumber: _favoriteNumber, name: _name}));
        nameToFavoriteNumber[_name] = _favoriteNumber;
    }

    //0xd9145CCE52D386f254917e481eB44e9943F39138
    //0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
    //0xCdb0955caCF1fBCcD74F1d1cEdDB00a118454cD9
    //0x497a39Ced1E96bEF2066c929bb58A9c7fc72272E - from
}
