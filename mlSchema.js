import mlModel from './mlModel'
import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type Item {
    id: ID
    title: String
    price: Int
    currency_id: String
    thumbnail: String
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
    search :async  (_, {query, after, first }) => {
        if (first < 0) {
          throw new Error('First must be positive');
        }
        let data  = await mlModel.search(query);        
        const totalCount = data.results.length;  
        let todos = [];
        let start = 0;
        if (after !== undefined) {          
          const id = Buffer.from(after, 'base64').toString('ascii')
          console.log("ID",id)        
          const index = data.results.findIndex((todo) => todo.id === id);
          if (index === -1) {
            throw new Error('After does not exist');
          }
          start = index + 1;
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


