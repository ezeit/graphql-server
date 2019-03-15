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
      page: Int,
      order: String
      ): SearchResult
  }

`

export const resolvers = {
  Query: {
    search: async (_, { query, page, order }) => {
      page = page - 1 || 0
      let data = await mlModel.search(query);
      const totalCount = data.results.length;
      if (order === 'DESC') {
        data.results.sort(function (a, b) {          
          if (a.title.trim() > b.title.trim()) {
            return -1;
          }
          if (a.title.trim() < b.title.trim()) {
            return 1;
          }
          return 0;
        });
      } else {
        data.results.sort(function (a, b) {
          if (a.title.trim() > b.title.trim()) {
            return 1;
          }
          if (a.title.trim() < b.title.trim()) {
            return -1;
          }
          return 0;
        });
      }
      const items = data.results.slice(5 * page, 5 * page + 5);
      const hasNextPage = 5 * page + 5 < totalCount;
      const pageInfo =
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


