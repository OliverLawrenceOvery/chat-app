# chat-app

# Introduction

Chat-app is a basic real-time chat application developed using Express and Socket.io within Node.js. Users can sign-up and have their login details stored in a MySQL database.

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Support](#support)
- [License](#license)

## Installation
Make sure you have MySQL workbench installed. Set-up a connection, making note of the user and password used. Create a database with the desired name, and make sure you are in the schema for this database. Use the syntax below to create a table for the usernames and emails of registered app users:
```shell
CREATE TABLE users (username VARCHAR(255), email VARCHAR(255));
ALTER TABLE users ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY;    
```
This enables users within the app to sign up with a username and email if they do not have an account, and these get stored in the created table. At the top of the 'routes.js' file, fill in the 'user', 'password' and 'database' parameters with the values corresponding to the MySQL connection.
Additionally, change the port number in the 'app.js' file if appropriate (default is 8080).
Ensure that you have node.js and npm installed. 
Install the relevant dependencies using
```shell
$ npm install
```
Once installed, the app can be run using the following command
```shell
node app.js
```

## Features

Chat-app features a MySQL connection allowing users on the same network to sign-up and have their own account, with account details stored in a database to enable future logging in.

A user is allocated a room with a randomly generated ID upon login, allowing each room to have a unique URL. This URL can be shared to allow up to two other people to be permitted into the room. This limit of three people can be adjusted by changing the following lines in 'routes.js':
```shell
40    else if(room.length < 3) {
.
.
49    else if(room.length >= 3) {
```
i.e. change '3' to the maximum number of desired users in any one room.
Once in the room, the user is able to type and send messages with the additional ability of uploading and sending images to the chat. 

The user can additionally toggle the room between day mode and night mode i.e. changing the colour palette appropriately.

A list of users is visible on the left hand side of the window. When other users join and subsequently leave the room, a message appears in the chat to notify everyone else in the room and the user list is updated accordingly.
