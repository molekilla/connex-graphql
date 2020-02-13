import { abi } from 'thor-devkit';
import * as utils from 'web3-utils';
import * as ethers from 'ethers';
import moment from 'moment';
import { flatMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

/**
 * Creates a thor-devkit event signature
 * @param topic event signature string
 */
const getEventSignatureFn = (topic: string) => {
    const splitParen = topic.split('(');
    const fnName = splitParen[0];
    const splitComma = splitParen[1].split(',');
    const inputs: abi.Event.Parameter[] = splitComma.map((i: string) => {
        const item: any = i.replace(')', '');
        return {
            name: `__${item}`,
            type: item,
            indexed: true,
        };
    })
    let fn = new abi.Event({
        inputs,
        type: 'event',
        name: fnName,
        anonymous: false,
    });
    return fn;
}

/**
 * Queries connex contract filter
 * @param visitor account visitor
 * @param input GraphQL input
 * @param abi Ethers ABI object
 */
const eventFilter = async (visitor: any, input: any, abi: ethers.ethers.utils.FunctionFragment | ethers.ethers.utils.EventFragment): Promise<any> => {
    const { range, offset, order, limit } = input.filter;
    let indexed = [{}];
    if (input.filter.indexed) {
        indexed = input.filter.indexed.map((i: any) => Object.assign({}, i));
    }
    const filter = visitor.filter(indexed);

    if (order) {
        filter.order(order);
    } else {
        filter.order('asc');
    }

    if (!input.filter.criterias) {
        input.filter.criterias = [];
    }
    const query = input.filter.criterias.map(i => {
        console.log(i, utils.isHex(i.topic0))
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
        return {
            ...i
        };
    });
    if (query.length > 0) {
        filter.criteria(query);
    }

    // get logs and apply limit
    let logs = await filter.apply(offset || 0, limit || 200);
    logs = logs.map((i: any) => {
        const timestamp = moment(new Date(i.meta.blockTimestamp * 1000));
        return {
            timestamp: i.meta ? timestamp : null,
            txDate: timestamp.toISOString(),
            ...i
        }
    });

    // apply date range
    if (range) {
        const from = moment(range.from, 'MM/DD/YYYY');
        const to = moment(range.to, 'MM/DD/YYYY');

        logs = logs.filter(i => {
            if (i.timestamp.unix() > from.unix() && i.timestamp.unix() <= to.unix()) {
                return true;
            }
            return false;
        })
            .map(i => {
                return {
                    ...i,
                    timestamp: i.timestamp.unix(),
                    logName: abi.name,
                }
            });
    }

    return logs;
}

export const contractFilter = (connex) =>
    async (obj, input) => {
        
        const logs: Promise<any>[] = input.abiSignatures.map((abiSignature: string) => {
            const abi = ethers.utils.parseSignature(abiSignature);
            const visitor = connex.thor.account(input.address).event(abi); 
            return eventFilter(visitor, input, abi);
        });        

        let unsorted: any[] = await from(logs)
        .pipe(            
            flatMap(i => i),
            toArray(),
        )
        .toPromise();

        unsorted = (unsorted as any).flat();
        
        const dateSort = (obj1, obj2) => {
            if (obj1.timestamp > obj2.timestamp) return -1;
            if (obj1.timestamp < obj2.timestamp) return 1;
            return 0;
        };
        // Sort by timestamp
        unsorted.sort(dateSort);
        return unsorted;
    }

export const filter = (connex) =>
    async (obj, input) => {
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
        } else {
            filter.order('asc');
        }

        const query = criterias.map(i => {
            console.log(i, utils.isHex(i.topic0))
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
            return {
                ...i
            };
        });
        if (query) {
            filter.criteria(query);
        }

        const logs = await filter.apply(0, limit || 200);
        return logs;
    }