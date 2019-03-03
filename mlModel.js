import sizeof from 'sizeof'
import fetch from 'node-fetch'

class MLItem {
    constructor() {
        this.querys = [];
        this.stored = new Map();
    }
  
    search(query) {        
        console.log("QUERY",query)
        if(this.stored.has(query))
            return this.stored.get(query);

        return fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`)
        .then((response) => {            
            return response.json();
        })
        .then((myJson) => {                     
            this.stored.set(query, myJson);
           return myJson
        });
    }
  }
  
  export default new MLItem()