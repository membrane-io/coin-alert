const { coinmarket, slack } = M.nodes;

export let btcInfo = {
    symbol: "BTC",
    price: 0.0
};
export let ethInfo = {
    symbol: "ETH",
    price: 0.0
};

export const reset = ({ previous }) => {
    if (previous.btcInfo) {
        btcInfo = {...previous.btcInfo};
    }

    if (previous.ethInfo) {
        ethInfo = {...previous.ethInfo};
    }
};

export const Root = {
    btc: async () => {
        try {
            const btcCoin = await coinmarket.echoSymbol({ symbol: "BTC" }).$query('{ price symbol }');
            return btcCoin;
        } catch (e) {
            throw e;
        }
    },
    eth: async () => {
        try {
            const { price, symbol } = await coinmarket.symbolPrice({ symbol: "ETH" }).$query('{ price symbol }');
            return { price, symbol };
        } catch (e) {
            throw e;
        }
    },
    startBTCMonitor: async () => {
        every('5m-BTC-monitor', 300, async (): Promise<void> => {
            const { price, symbol } = await Root.btc();

            let text = "";
            if (btcInfo.price === 0) {
                text = `the price of ${symbol} is ${price}`;
            } else {
                const diff = ((btcInfo.price - price) * 100 / price) * -1;
                text = `the price of ${symbol} has changed from ${btcInfo.price} to ${price} that is a ${diff.toFixed(2)}% from last time`;
            }

            try {
                await slack.sendMsg({ text }).$invoke();
            } catch (e) {
                throw e;
            }

            btcInfo = { price, symbol };
        });
        return 'BTC Monitor started';
    }
}
