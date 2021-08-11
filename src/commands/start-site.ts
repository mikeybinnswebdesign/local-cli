import {Command} from '@oclif/command'
import createGraphQLClient, {gql} from '../helpers/graphql-client'
import getSiteId from '../helpers/get-site-id'
import Table = require('cli-table')

export default class StartSite extends Command {
  static description = 'start a Local site and all of its services'

  static examples = [
    '$ local-cli start-site 6mC6PsMCh',
  ]

  static flags = {}

  static args = [
    {name: 'siteID', required: true},
  ]

  async run() {
    const {args} = this.parse(StartSite)

    // Automatic name lookup
    var siteName = args.siteID;
    if(getSiteId(siteName)){
      var siteID = getSiteId(args.siteID);
      console.log('Automatically found SiteID for ' + siteName + ' = ' + siteID )
      args.siteID = siteID
    }

    const query = gql`
      mutation ($siteID: ID!) {
        startSite(id: $siteID) {
          id
          name
          status
        }
      }
    `

    const client = createGraphQLClient()

    try {
      const data = await client.request(query, {
        siteID: args.siteID,
      })

      const table = new Table({
        head: ['ID', 'Name', 'Status'],
      })

      table.push(Object.values(data.startSite))

      this.log(table.toString())
    } catch(error) {
      console.error("\n⚠️  Something went wrong! Are you sure the site ID is correct? \n")
      console.error(JSON.stringify(error, undefined, 2))
      process.exit(1)
    }
  }
}
