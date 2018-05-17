import React, {Component} from 'react';
import {Card, Grid, Button} from 'semantic-ui-react';
import Layout from '../../components/layout';
import Campaign from '../../ethereum/campaign';
import web3 from '../../ethereum/web3';
import ContributeForm from '../../components/contributeForm';
import {Link} from '../../routes';



class CampaignShow extends Component {
  // this props is different than inside render
  static async getInitialProps(props) {
    // address of the campaign, as defined in routes.js
    const campaign = Campaign(props.query.address);
    const summary = await campaign.methods.getSummary().call();

    return {
      minContribution: summary['0'],
      balance: summary[1],
      requestsCount: summary[2],
      contributorsCount: summary[3],
      manager: summary[4],
      address: props.query.address
    };
  }

  renderCards() {
    const {
      minContribution,
      balance,
      requestsCount,
      contributorsCount,
      manager
    } = this.props;

    const items = [
      {
        header: manager,
        meta: 'Address of Manager',
        description: 'The manager created this campaign and can create requests.',
        style: {overflowWrap: 'break-word'}
      },
      {
        header: minContribution,
        meta: 'Minimum Contribution (Wei)',
        description: 'You must contribute at least this much wei to become backer.',
        style: {overflowWrap: 'break-word'}
      },
      {
        header: requestsCount,
        meta: 'Number of Requests',
        description: 'A request tries to withdraw money from the contract. Backers must approve in order for the request to proceed.',
        style: {overflowWrap: 'break-word'}
      },
      {
        header: contributorsCount,
        meta: 'Number of Backers',
        description: 'Number of people who have already backed the campaign.',
        style: {overflowWrap: 'break-word'}
      },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Campaign Balance (ether)',
        description: 'The amount of money left in the contract.',
        style: {overflowWrap: 'break-word'}
      }
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Campaign</h3>
        
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {this.renderCards()}
            </Grid.Column>

            <Grid.Column width={6}>
              <ContributeForm address={this.props.address}/>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${this.props.address}/requests`} >
                <a>
                  <Button primary> View Requests</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  };
};

export default CampaignShow;
