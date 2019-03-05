import mlModel from './mlModel'
import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type Item {
    id: ID
    title: String
    price: Float
    currency_id: String
    thumbnail: String
    available_quantity: Int
    sold_quantity: Int
    buying_mode: String
    listing_type_id: String
    condition: String
    accepts_mercadopago: Boolean
    shipping: Shipping
  }

  type Shipping {
    free_shipping: Boolean
    mode: String    
    logistic_type : String
    store_pick_up : Boolean
  }

    type PageInfo {
        endCursor: String
        hasNextPage: Boolean!
    }
    type SearchResult {
        items: [Item]!
        pageInfo: PageInfo!
        totalCount: Int!
    }
    type Query {
        search(
        query: String
        before: String
        after: String
        first: Int,
        ): SearchResult
    }

`

export const resolvers = {
    Query: {
    //   users() {
    //     return userModel.list()
    //   },
    search :async  (_, {query, before, after, first }) => {
        if (first < 0) {
          throw new Error('First must be positive');
        }
        let data  = await mlModel.search(query);        
        const totalCount = data.results.length;  
        let todos = [];
        let start = 0;
        if (after !== undefined) {          
          const id = Buffer.from(after, 'base64').toString('ascii')    
          const index = data.results.findIndex((todo) => todo.id === id);
          if (index === -1)           
            throw new Error('After does not exist');

          start = index + 1;          
        }else if(before != undefined){      
          const id = Buffer.from(before, 'base64').toString('ascii')    
          const index = data.results.findIndex((todo) => todo.id === id);
          if (index === -1)           
            throw new Error('Before does not exist');
                
          start = index - 9;
        }


        todos = first === undefined ?
          data.results :
          data.results.slice(start, start + first);
        let endCursor;
        const items = todos.map((todo) => {
            endCursor = Buffer.from(todo.id).toString('base64');          
        //   return ({
        //     cursor: endCursor,
        //     node: todo,
        //   });        
        return todo;
        });
        const hasNextPage = start + first < totalCount;
        const pageInfo = endCursor !== undefined ?
          {
            endCursor,
            hasNextPage,
          } :
          {
            hasNextPage,
          };
        const result = {
          items,
          pageInfo,
          totalCount,
        };
        return result;
      }
    }
  }


