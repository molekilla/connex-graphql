"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thor_devkit_1 = require("thor-devkit");
const utils = __importStar(require("web3-utils"));
const ethers = __importStar(require("ethers"));
const moment_1 = __importDefault(require("moment"));
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const getEventSignatureFn = (topic) => {
    const splitParen = topic.split('(');
    const fnName = splitParen[0];
    const splitComma = splitParen[1].split(',');
    const inputs = splitComma.map((i) => {
        const item = i.replace(')', '');
        return {
            name: `__${item}`,
            type: item,
            indexed: true,
        };
    });
    let fn = new thor_devkit_1.abi.Event({
        inputs,
        type: 'event',
        name: fnName,
        anonymous: false,
    });
    return fn;
};
const eventFilter = async (visitor, input, abi) => {
    const { range, offset, order, limit } = input.filter;
    let indexed = [{}];
    if (input.filter.indexed) {
        indexed = input.filter.indexed.map((i) => Object.assign({}, i));
    }
    const filter = visitor.filter(indexed);
    if (order) {
        filter.order(order);
    }
    else {
        filter.order('asc');
    }
    if (!input.filter.criterias) {
        input.filter.criterias = [];
    }
    const query = input.filter.criterias.map(i => {
        console.log(i, utils.isHex(i.topic0));
        if (i.topic0 && !utils.isHex(i.topic0)) {
            i.topic0 = getEventSignatureFn(i.topic0).signature;
        }
        if (i.topic1 && !utils.isHex(i.topic1)) {
            i.topic1 = getEventSignatureFn(i.topic1).signature;
        }
        if (i.topic2 && !utils.isHex(i.topic2)) {
            i.topic2 = getEventSignatureFn(i.topic2).signature;
        }
        if (i.topic3 && !utils.isHex(i.topic3)) {
            i.topic3 = getEventSignatureFn(i.topic3).signature;
        }
        if (i.topic4 && !utils.isHex(i.topic4)) {
            i.topic4 = getEventSignatureFn(i.topic4).signature;
        }
        return Object.assign({}, i);
    });
    if (query.length > 0) {
        filter.criteria(query);
    }
    let logs = await filter.apply(offset || 0, limit || 200);
    logs = logs.map((i) => {
        const timestamp = moment_1.default(new Date(i.meta.blockTimestamp * 1000));
        return Object.assign({ timestamp: i.meta ? timestamp : null, txDate: timestamp.toISOString() }, i);
    });
    if (range) {
        const from = moment_1.default(range.from, 'MM/DD/YYYY');
        const to = moment_1.default(range.to, 'MM/DD/YYYY');
        logs = logs.filter(i => {
            if (i.timestamp.unix() > from.unix() && i.timestamp.unix() <= to.unix()) {
                return true;
            }
            return false;
        })
            .map(i => {
            return Object.assign({}, i, { timestamp: i.timestamp.unix(), logName: abi.name });
        });
    }
    return logs;
};
exports.contractFilter = (connex) => async (obj, input) => {
    const logs = input.abiSignatures.map((abiSignature) => {
        const abi = ethers.utils.parseSignature(abiSignature);
        const visitor = connex.thor.account(input.address).event(abi);
        return eventFilter(visitor, input, abi);
    });
    let unsorted = await rxjs_1.from(logs)
        .pipe(operators_1.flatMap(i => i), operators_1.toArray())
        .toPromise();
    unsorted = unsorted.flat();
    const dateSort = (obj1, obj2) => {
        if (obj1.timestamp > obj2.timestamp)
            return -1;
        if (obj1.timestamp < obj2.timestamp)
            return 1;
        return 0;
    };
    unsorted.sort(dateSort);
    return unsorted;
};
exports.filter = (connex) => async (obj, input) => {
    const { kind, range, order, limit, criterias } = input.filter;
    const filter = connex.thor.filter(kind);
    if (range) {
        filter.range({
            unit: range.unit === 'block' ? range.unit : 'time',
            from: range.from,
            to: range.to,
        });
    }
    if (order) {
        filter.order(order);
    }
    else {
        filter.order('asc');
    }
    const query = criterias.map(i => {
        console.log(i, utils.isHex(i.topic0));
        if (i.topic0 && !utils.isHex(i.topic0)) {
            i.topic0 = getEventSignatureFn(i.topic0).signature;
        }
        if (i.topic1 && !utils.isHex(i.topic1)) {
            i.topic1 = getEventSignatureFn(i.topic1).signature;
        }
        if (i.topic2 && !utils.isHex(i.topic2)) {
            i.topic2 = getEventSignatureFn(i.topic2).signature;
        }
        if (i.topic3 && !utils.isHex(i.topic3)) {
            i.topic3 = getEventSignatureFn(i.topic3).signature;
        }
        if (i.topic4 && !utils.isHex(i.topic4)) {
            i.topic4 = getEventSignatureFn(i.topic4).signature;
        }
        return Object.assign({}, i);
    });
    if (query) {
        filter.criteria(query);
    }
    const logs = await filter.apply(0, limit || 200);
    return logs;
};
