import React, { Component } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import HttpDataProvider from '../../../../app/utils/httpProvider';
import _ from 'lodash'; // eslint-disable-line
import TitleIcon from '../../../images/icons/latest-blocks.svg';
import { setBlockData } from '../../controllers/blocks/action';
import { getBlockUpdateDetails } from '../../controllers/blocks/selector';
import Wrapper from '../../wrapper/wrapper';

class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      blockData: [],
      error: '',
      lastFetchedPage: 2,
      currentPage: 0,
      hasNextPage: true,
      currentPageVal: 0,
    };
    this.onChangePage = this.onChangePage.bind(this);
    this.maxPageVal = 0;
  }

  setSearchText(e) {
    this.setState({
      searchText: e.target.value,
    });
  }

  onChangePage = (type) => {
    const { currentPageVal } = this.state;
    const { allBlockData } = this.props.blockDetails;
    const { setBlocksData } = this.props;
    const updatePageVal =
      type === 'next' ? currentPageVal + 1 : currentPageVal - 1;
    if (updatePageVal < 0) {
      return;
    }

    const currentBlockDataLength = allBlockData.length;
    if (
      type === 'next' &&
      (currentPageVal + 1) * 10 >= currentBlockDataLength
    ) {
      return;
    }
    const prevPageVal = currentPageVal;

    this.setState({
      currentPageVal: updatePageVal,
    });
    const cursor = allBlockData[allBlockData.length - 1].cursor;
    if (type === 'next' && this.maxPageVal < updatePageVal) {
      if (true) {
        HttpDataProvider.post('http://18.216.205.167:5000/graphql?', {
          query: `
          {
            blocks(first: 10, byDirection: "desc", after: "${cursor}") {
              pageInfo {
                hasNextPage
              }
              edges {
                cursor,
                node {
                  id,
                  payload
                }
              }
            }
          }`,
        })
          .then(
            (res) => {
              if (res && res.data) {
                this.maxPageVal = updatePageVal;
                const allData = res.data;
                if (
                  allData.data &&
                  allData.data.blocks &&
                  allData.data.blocks.edges &&
                  allData.data.blocks.edges.length
                ) {
                  const blockDetails = {
                    payload: allData.data.blocks.edges,
                  };
                  setBlocksData(blockDetails);
                  this.setState((prevState) => ({
                    lastFetchedPage: allData.data.blocks.pageInfo.hasNextPage
                      ? prevState.lastFetchedPage + 1
                      : prevState.lastFetchedPage,
                    hasNextPage: allData.data.blocks.pageInfo.hasNextPage,
                  }));
                } else {
                  console.log('else part');
                }
              }
              return null;
            },
            () => {
              console.log('1');
            }
          )
          .catch((err) => {
            console.log(err, 'err in graphql');
          });
      }
    }
  };

  renderBlockList() {
    const { currentPageVal } = this.state;
    const { blockDetails, history } = this.props;
    const from = currentPageVal * 10;
    const to = from + 10;

    if (blockDetails && blockDetails.allBlockData) {
      const transformedBlockArray = blockDetails.allBlockData.slice(from, to);
      if (true) {
        return (
          <Row>
            <Col>
              <Table className="blocks-table">
                <thead>
                  <tr>
                    <th>Height</th>
                    {/* <th>Age</th> */}
                    <th>Txn</th>
                    <th>hash</th>
                    <th>Round</th>
                  </tr>
                </thead>
                <tbody className="">
                  {transformedBlockArray &&
                    transformedBlockArray.length > 0 &&
                    transformedBlockArray.map((data, index) => (
                      <tr
                        key={index}
                        onClick={() =>
                          history.push({
                            pathname: `/blocks/${data.height}`,
                            state: { data, type: 'block' },
                          })
                        }
                      >
                        <td
                          data-head="Height"
                          className="text-primary full head"
                        >
                          <span className="icon icon-block">{data.height}</span>
                        </td>
                        <td
                          data-head="Txn"
                          className="text-primary full-wrap txn"
                        >
                          {data.transactions.length}
                        </td>
                        <td
                          data-head="hash"
                          className="text-primary full-wrap hash text-ellipsis"
                        >
                          {data.hash}
                        </td>
                        <td data-head="Round" className=" full-wrap round">
                          <span className="o-5">{data.round}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        );
      }
    }
    return null;
  }

  onShowList = () => {
    const { history } = this.props;
    history.push('/blocks');
    this.setState({
      searchText: '',
      error: '',
    });
  };

  render() {
    const { searchText, currentPageVal } = this.state;
    const { blockDetails, history } = this.props;
    let descriptionBlock = '';
    const from = currentPageVal * 10;
    const to = from + 10;
    let totalBlocks = '';

    if (blockDetails && blockDetails.allBlockData) {
      const transformedBlockArray = blockDetails.allBlockData.slice(from, to);

      const {
        blockDetails: { allBlockData },
      } = this.props;
      if (allBlockData.length) {
        const firstBlock = allBlockData[0];
        totalBlocks = ` (Total of ${firstBlock.height} Blocks)`;
      }

      if (transformedBlockArray && transformedBlockArray.length) {
        const firstBlock = transformedBlockArray[0];
        const lastBlock =
          transformedBlockArray[transformedBlockArray.length - 1];
        descriptionBlock = `Block #${lastBlock.height} To #${
          firstBlock.height
        } `;
      }
    }
    return (
      <div>
        <Wrapper
          setSearchText={(e) => this.setSearchText(e)}
          searchText={searchText}
          onChangePage={this.onChangePage}
          icon={TitleIcon}
          title="Blocks"
          block={descriptionBlock}
          total={totalBlocks}
          onShowList={this.onShowList}
          currentPage={this.state.currentPageVal}
          history={history}
          placeHolder="Search by Transaction Hash / Block Number"
          pagination
        >
          {this.state.error ? (
            <p className="text-white">{this.state.error}</p>
          ) : (
            this.renderBlockList()
          )}
        </Wrapper>
      </div>
    );
  }
}

Blocks.propTypes = {
  setBlockData: PropTypes.func,
};

const mapStateToProps = createSelector(
  getBlockUpdateDetails(),
  (blockDetails) => ({ blockDetails })
);

const mapDispatchToProps = (dispatch) => ({
  setBlocksData: (blockData) => dispatch(setBlockData(blockData)),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Blocks);
