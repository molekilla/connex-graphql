export const account = (connex) => async (obj, { address }) => {
    const resp = await connex.thor.account(address).get();
    return {
        address,
        ...resp,
    }
}

export const accountCode = (connex) => async (obj) => {
    const { code } = await connex.thor.account(obj.address).getCode();
    return code;
}