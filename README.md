# Catwalk

Catwalk is a social media platform currently in development. Currently, users are allowed to make accounts, make posts, comment, 'like' a post, add a friend, navigate around profiles, and customize their bio.

### Usage

First, ensure you have node.js and podman installed on your machine. To avoid permissions conflicts and save space in the repository, the ```node_modules``` folder has not been commited. Because of this, you must first make sure you are in the ```CatwalkSM``` directory, then run ```npm install``` in the command line. Repeat this with ```Catwalk``` and ```server```. After this, the ```node_modules``` folder should be created locally.

After doing this, start the db containers with the provided shell script followed by starting the express script.
