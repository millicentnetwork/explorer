// @flow

import { setBlockData } from 'src/storage/actions/blocks';
import { setRealtimeUpdateDetails } from 'src/storage/actions/realtimeBlockchainUpdate';
import { setUserDetails } from 'src/storage/actions/userDetails';
import {
    setLatestBlocksData,
    updateLatestBlocksData,
} from 'src/storage/actions/latestBlocksData';

import {
    SET_BLOCK_DATA,
    SET_REALTIME_UPDATE,
    SET_USER_DETAILS,
    SET_LATEST_BLOCKS_DATA,
    UPDATE_LATEST_BLOCKS_DATA,
} from 'src/storage/constants';

describe('Redux actions: blocks', function blocksActions() {
    it('should return correct setBlockData object', function () {
        const dataMock = { payload: 'some data' };
        const setDataAction = setBlockData(dataMock);

        expect(setDataAction).toEqual({
            type: SET_BLOCK_DATA,
            blocksDetails: dataMock.payload,
        });
    });
});

describe('Redux actions: realtimeBlockchainUpdate', function rbuActions() {
    it('should return correct setRealtimeUpdateDetails object', function () {
        const dataMock = { isRealtimeUpdate: true };
        const setRudAction = setRealtimeUpdateDetails(dataMock);

        expect(setRudAction).toEqual({
            type: SET_REALTIME_UPDATE,
            realtimeUpdate: dataMock,
        });
    });
});

describe('Redux actions: userDetails', function userDetails() {
    it('should return correct setUserDetails object', function () {
        const dataMock = { id: 'id', email: 'email@example.org' };
        const setUserDetailsAction = setUserDetails(dataMock);

        expect(setUserDetailsAction).toEqual({
            type: SET_USER_DETAILS,
            userDetails: { ...dataMock },
        });
    });
});

describe('Redux actions: latestBlocksData', function latestBlocksData() {
    const blockMock = {
        difficulty: '2',
        extraData: '0x0',
        gasLimit: 100000,
        gasUsed: 10000000,
        hash: 'string',
        logsBloom: '0x0',
        miner: '0x0',
        mixHash: '0x0',
        nonce: '0x0',
        number: 0,
        parentHash: '0x0',
        receiptsRoot: '0x0',
        sha3Uncles: '0x0',
        size: 0,
        stateRoot: '0x0',
        timestamp: 1000,
        totalDifficulty: '0x0',
        transactions: [],
        transactionsRoot: '0x0',
        uncles: [],
    };

    const dataMock = { blocks: [blockMock] };

    it('should return correct setLatestBlocksData object', function () {
        const setLatestBlocksDataAction = setLatestBlocksData(dataMock);

        expect(setLatestBlocksDataAction).toEqual({
            type: SET_LATEST_BLOCKS_DATA,
            payload: dataMock,
        });
    });

    it('should return correct updateLatestBlocksData object', function () {
        const updateLatestBlocksDataAction = updateLatestBlocksData(blockMock);

        expect(updateLatestBlocksDataAction).toEqual({
            type: UPDATE_LATEST_BLOCKS_DATA,
            payload: blockMock,
        });
    });
});




