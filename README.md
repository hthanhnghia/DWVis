meteor add d3js:d3

mongoimport -h localhost:3001 --db meteor --collection users --type json --file users.json --jsonArray

mongoimport -h localhost:3001 --db meteor --collection nodes --type json --file nodes.json --jsonArray

mongoimport -h localhost:3001 --db meteor --collection links --type json --file links.json --jsonArray