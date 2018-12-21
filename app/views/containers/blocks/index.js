import React, { Component } from 'react';
import { Row, Col, Table } from 'reactstrap';
import moment from 'moment'; // eslint-disable-lin
import HttpDataProvider from '../../../../app/utils/httpProvider';
import _ from 'lodash'; // eslint-disable-line
import { createSelector } from 'reselect';
import TitleIcon from '../../../images/icons/latest-blocks.svg';
import PropTypes from 'prop-types';
import { setBlockData } from '../../controllers/blocks/action';
import { getBlockUpdateDetails } from '../../controllers/blocks/selector';
import { connect } from 'react-redux';
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
      isSearch: false,
      hasNextPage: true,

      currentPageVal: 0,
    };

    this.maxPageVal = 0;
    this.showDetail = this.showDetail.bind(this);
  }

  setSearchText(e) {
    this.setState({
      searchText: e.target.value,
    });

    if (e.target.value === '') {
      this.setState({
        error: '',
        isSearch: false,
        blockData: [],
      });
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.match.params.id) {
      if (props.location.state) {
        const data = [
          {
            ...props.location.state.data,
            transactions: props.location.state.data.transaction,
          },
        ];
        return {
          blockData: data,
        };
      }
    }

    return {
      ...state,
      isSearch: false,
    };
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

  /**
   * loadFantomBlockData() :  Function to create array of objects from response of Api calling for storing blocks.
   * @param {*} responseJson : Json of block response data from Api.
   */
  loadFantomBlockData(allData) {
    const result = allData.payload;
    let blockData = [];
    const txLength =
      allData.payload.transactions !== null
        ? allData.payload.transactions.length
        : 0;
    blockData.push({
      height: result.index,
      hash: result.hash,
      round: result.round,
      transactions: txLength,
    });
    this.props.history.push({
      pathname: `/blocks/${result.index}`,
      state: {
        data: {
          height: result.index,
          hash: result.hash,
          round: result.round,
          transactions: txLength,
        },
        type: 'block',
      },
    });
    blockData = blockData.reverse();
    this.setState({
      blockData,
    });
  }

  /**
   * getFantomBlocks():  Api to fetch blocks for given index of block of Fantom own endpoint.
   * @param {String} searchBlockIndex : Index to fetch block.
   */
  getFantomBlocks(searchText) {
    const searchQuery = `index:${searchText}`;
    HttpDataProvider.post('http://18.216.205.167:5000/graphql?', {
      query: `
          {
           block(${searchQuery}) {
            id,payload
          }
          }`,
    })
      .then((response) => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.block
        ) {
          this.loadFantomBlockData(response.data.data.block);
        } else {
          this.setState({
            blockData: [],
            error: 'No Record Found',
          });
        }
      })
      .catch((error) => {
        this.setState({
          blockData: [],
          error: error.message || 'Internal Server Error',
        });
      });
  }

  showDetail(blockNumber) {
    if (blockNumber === '') {
      return;
    }
    this.props.history.push(`/block/${blockNumber}`); // eslint-disable-line
  }

  renderBlockList() {
    const { isSearch, currentPage, currentPageVal } = this.state;
    const { blockData } = this.props.blockDetails;

    const from = currentPageVal * 10;
    const to = from + 10;

    if (this.props.blockDetails && this.props.blockDetails.allBlockData) {
      const transformedBlockArray = this.props.blockDetails.allBlockData.slice(
        from,
        to
      );
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
                          this.props.history.push({
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
    this.props.history.push('/blocks');
    this.setState({
      searchText: '',
      isSearch: false,
      error: '',
      // isRoute: false,
    });
  };

  render() {
    // const blocks = this.state.blockArray; // eslint-disable-line
    const {
      searchText,
      blockData,
      error,
      allBlockData,
      isSearch,
      currentPageVal,
    } = this.state;

    let descriptionBlock = '';
    const from = currentPageVal * 10;
    const to = from + 10;
    let totalBlocks = '';
    if (this.props.blockDetails && this.props.blockDetails.allBlockData) {
      const transformedBlockArray = this.props.blockDetails.allBlockData.slice(
        from,
        to
      );

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
          isSearching={isSearch}
          onShowList={this.onShowList}
          currentPage={this.state.currentPageVal}
          history={this.props.history}
          placeHolder="Search by Transaction Hash / Block Number"
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
