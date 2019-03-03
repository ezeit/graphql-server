import userModel from './models'
import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: ID
    name: String
    age: Int
    email: String
    friends: [User]
  }

    type Edge {
        cursor: String!
        node: User!
    }

    type PageInfo {
        endCursor: String
        hasNextPage: Boolean!
    }
    type TodosResultCursor {
        edges: [User]!
        pageInfo: PageInfo!
        totalCount: Int!
    }
    type Query {
        allTodosCursor(
        after: String
        first: Int,
        ): TodosResultCursor
    }

`

export const resolvers = {
    Query: {
    //   users() {
    //     return userModel.list()
    //   },
    allTodosCursor :async  (_, { after, first }) => {
        if (first < 0) {
          throw new Error('First must be positive');
        }
        let data  = await userModel.list();
        const totalCount = data.length;        
        let todos = [];
        let start = 0;
        if (after !== undefined) {          
          const id = parseInt(Buffer.from(after, 'base64').toString('ascii'),10)
          console.log("ID",id)        
          const index = data.findIndex((todo) => todo.id === id);
          if (index === -1) {
            throw new Error('After does not exist');
          }
          start = index + 1;
        }
        todos = first === undefined ?
          data :
          data.slice(start, start + first);
        let endCursor;
        const edges = todos.map((todo) => {
            endCursor = Buffer.from(todo.id.toString()).toString('base64');          
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
          edges,
          pageInfo,
          totalCount,
        };
        return result;
      }
    }
  }


