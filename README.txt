The goal of this application is to allow the users to find location of an IPv4 address. This application also validates the IP address both on 
frontend and backend and displays error messages accordingly. To find the location of an IPv4 address, I used the MaxMind GeoLite2 database 
(https://dev.maxmind.com/geoip/geoip2/geolite2/) which is a database of geolocation information.


###### Following are some commands that can be used to run this project:

# To run the project:
docker-compose up

# To rebuild and then run the project:
docker-compose up --build

###### Testing:

In order to test the application, 
1. Run the following command `docker-compose up --build` 
2. Visit `http://localhost:8000/` on your browser 
3. Enter an IP address to find the latitude and longitude of the ip address.