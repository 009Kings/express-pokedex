require('dotenv').config();
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var app = express();
var db = require('./models');
var methodOverride = require('method-override');

app.use(require('morgan')('dev'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Helper Function
function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase()+string.slice(1);
}

// GET / - main index of site
app.get('/', function(req, res) {
  var pokemonUrl = 'http://pokeapi.co/api/v2/pokemon/';
  // Use request to call the API
  request(pokemonUrl, function(error, response, body) {
    if (error || response.statusCode != 200) {
      res.render("error", {error: error, errorLocale: "Main index of the site: index.js, line: 28"})
    } 
    var pokemon = JSON.parse(body).results;
    pokemon = pokemon.slice(0, 151);

    db.pokeman.findAll().then((favePokemon)=>{
      pokemon.forEach((pokeman)=>{
        pokeman.name = capitaliseFirstLetter(pokeman.name);
        favePokemon.forEach((favePokeman)=>{
          if (pokeman.name === favePokeman.name) {
            pokeman.isFave = true;
          }
        })
      })
      res.render('index', { pokemon: pokemon });
    })
  });
});

// Imports all routes from the pokemon routes file
app.use('/pokemon', require('./routes/pokemon'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
