import "./styles.css";
import Portis from "@portis/web3";
import { IExec } from "iexec";

const networkOutput = document.getElementById("network");
const addressOutput = document.getElementById("address");
const rlcWalletOutput = document.getElementById("rlc-wallet");
const nativeWalletOutput = document.getElementById("native-wallet");
const accountOutput = document.getElementById("account");
const accountDepositInput = document.getElementById("account-deposit-input");
const accountDepositButton = document.getElementById("account-deposit-button");
const accountDepositError = document.getElementById("account-deposit-error");
const accountWithdrawInput = document.getElementById("account-withdraw-input");
const accountWithdrawButton = document.getElementById(
  "account-withdraw-button"
);
const accountWithdrawError = document.getElementById("account-withdraw-error");
const appsShowInput = document.getElementById("apps-address-input");
const appsShowButton = document.getElementById("apps-show-button");
const appsShowError = document.getElementById("apps-show-error");
const appsShowOutput = document.getElementById("apps-details-output");
const buyBuyButton = document.getElementById("buy-buy-button");
const buyBuyError = document.getElementById("buy-buy-error");
const buyBuyOutput = document.getElementById("buy-dealid-output");
const buyAppAddressInput = document.getElementById("buy-appaddress-input");
const buyCategoryInput = document.getElementById("buy-category-input");
const buyParamsInput1 = document.getElementById("buy-params-input-1");
const buyParamsInput2 = document.getElementById("buy-params-input-2");
const buyParamsInput3 = document.getElementById("buy-params-input-3");
const buyParamsInput =
  buyParamsInput1 + " " + buyParamsInput2 + " " + buyParamsInput3;

const previousDealsButton = document.getElementById("previous-deals-button");
const previousDealsError = document.getElementById("previous-deals-error");
const previousDealsOutput = document.getElementById("previous-deals-output");
const resultsDealidInput = document.getElementById("results-dealid-input");
const resultsShowDealButton = document.getElementById(
  "results-showdeal-button"
);
const resultsShowDealError = document.getElementById("results-showdeal-error");
const resultsShowDealOutput = document.getElementById(
  "results-dealdetails-output"
);
const resultsTaskidInput = document.getElementById("results-taskid-input");
const resultsShowTaskButton = document.getElementById(
  "results-showtask-button"
);
const resultsShowTaskError = document.getElementById("results-showtask-error");
const resultsShowTaskOutput = document.getElementById(
  "results-taskdetails-output"
);
const resultsDownloadInput = document.getElementById("results-download-input");
const resultsDownloadButton = document.getElementById(
  "results-download-button"
);
const resultsDownloadError = document.getElementById("results-download-error");

const refreshUser = iexec => async () => {
  const userAddress = await iexec.wallet.getAddress();
  const [wallet, account] = await Promise.all([
    iexec.wallet.checkBalances(userAddress),
    iexec.account.checkBalance(userAddress)
  ]);
  const nativeWalletText = wallet.wei.isZero()
    ? '<a href="https://faucet.kovan.network/" target="_blank">Need some kovan Eth to continue?</a>'
    : `${wallet.wei} wei`;
  const rlcWalletText = wallet.nRLC.isZero()
    ? `<a href="https://faucet.iex.ec/kovan/${userAddress}" target="_blank">Need some kovan RLC to continue?</a>`
    : `${wallet.nRLC} nRLC`;
  addressOutput.innerText = userAddress;
  rlcWalletOutput.innerHTML = rlcWalletText;
  nativeWalletOutput.innerHTML = nativeWalletText;
  accountOutput.innerText = `${account.stake} nRLC (+ ${account.locked} nRLC locked)`;
};

const deposit = iexec => async () => {
  try {
    accountDepositButton.disabled = true;
    accountDepositError.innerText = "";
    const amount = accountDepositInput.value;
    await iexec.account.deposit(amount);
    refreshUser(iexec)();
  } catch (error) {
    accountDepositError.innerText = error;
  } finally {
    accountDepositButton.disabled = false;
  }
};

const withdraw = iexec => async () => {
  try {
    accountWithdrawButton.disabled = true;
    accountWithdrawError.innerText = "";
    const amount = accountWithdrawInput.value;
    await iexec.account.withdraw(amount);
    refreshUser(iexec)();
  } catch (error) {
    accountWithdrawError.innerText = error;
  } finally {
    accountWithdrawButton.disabled = false;
  }
};

const showApp = iexec => async () => {
  try {
    appsShowButton.disabled = true;
    appsShowError.innerText = "";
    appsShowOutput.innerText = "";
    const appAddress = appsShowInput.value;
    const res = await iexec.app.showApp(appAddress);
    appsShowOutput.innerText = JSON.stringify(res, null, 2);
  } catch (error) {
    appsShowError.innerText = error;
  } finally {
    appsShowButton.disabled = false;
  }
};

const buyComputation = iexec => async () => {
  try {
    buyBuyButton.disabled = true;
    buyBuyError.innerText = "";
    buyBuyOutput.innerText = "";
    const appAddress = buyAppAddressInput.value;
    const category = buyCategoryInput.value;
    const params = buyParamsInput.value;
    const { appOrders } = await iexec.orderbook.fetchAppOrderbook(appAddress);
    const appOrder = appOrders && appOrders[0] && appOrders[0].order;
    if (!appOrder) throw Error(`no apporder found for app ${appAddress}`);
    const { workerpoolOrders } = await iexec.orderbook.fetchWorkerpoolOrderbook(
      category
    );
    const workerpoolOrder =
      workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;
    if (!workerpoolOrder)
      throw Error(`no workerpoolorder found for category ${category}`);

    const userAddress = await iexec.wallet.getAddress();

    const requestOrderToSign = await iexec.order.createRequestorder({
      app: appAddress,
      appmaxprice: appOrder.appprice,
      workerpoolmaxprice: workerpoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: params,
      category: category
    });

    const requestOrder = await iexec.order.signRequestorder(requestOrderToSign);

    const res = await iexec.order.matchOrders({
      apporder: appOrder,
      requestorder: requestOrder,
      workerpoolorder: workerpoolOrder
    });
    buyBuyOutput.innerText = JSON.stringify(res, null, 2);
    resultsDealidInput.value = res.dealid;
    refreshUser(iexec)();
  } catch (error) {
    buyBuyError.innerText = error;
  } finally {
    buyBuyButton.disabled = false;
  }
};

const showPreviousDeals = iexec => async () => {
  try {
    previousDealsButton.disabled = true;
    previousDealsError.innerText = "";
    previousDealsOutput.innerText = "";
    const userAddress = await iexec.wallet.getAddress();
    const deals = await iexec.deal.fetchRequesterDeals(userAddress);
    previousDealsOutput.innerText = JSON.stringify(deals, null, 2);
  } catch (error) {
    previousDealsError.innerText = error;
  } finally {
    previousDealsButton.disabled = false;
  }
};

const showDeal = iexec => async () => {
  try {
    resultsShowDealButton.disabled = true;
    resultsShowDealError.innerText = "";
    resultsShowDealOutput.innerText = "";
    const dealid = resultsDealidInput.value;
    const deal = await iexec.deal.show(dealid);
    resultsShowDealOutput.innerText = JSON.stringify(deal, null, 2);
    resultsTaskidInput.value = deal.tasks["0"];
    resultsDownloadInput.value = deal.tasks["0"];
  } catch (error) {
    resultsShowDealError.innerText = error;
  } finally {
    resultsShowDealButton.disabled = false;
  }
};

const showTask = iexec => async () => {
  try {
    resultsShowTaskButton.disabled = true;
    resultsShowTaskError.innerText = "";
    resultsShowTaskOutput.innerText = "";
    const taskid = resultsTaskidInput.value;
    const res = await iexec.task.show(taskid);
    resultsShowTaskOutput.innerText = JSON.stringify(res, null, 2);
  } catch (error) {
    resultsShowTaskError.innerText = error;
  } finally {
    resultsShowTaskButton.disabled = false;
  }
};

const dowloadResults = iexec => async () => {
  try {
    resultsDownloadButton.disabled = true;
    resultsDownloadError.innerText = "";
    const taskid = resultsDownloadInput.value;
    const res = await iexec.task.fetchResults(taskid, {
      ipfsGatewayURL: "https://ipfs.iex.ec"
    });
    const file = await res.blob();

    /*
    const fileName = `${taskid}.zip`;
    if (window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(file, fileName);
    else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
    */

    function blob2data(blob) {
      const fd = new FormData();
      fd.set("a", blob);
      return fd.get("a");
    }
    var data = blob2data(file);

    var JSZip = require("jszip");
    var zip = new JSZip();

    zip
      .loadAsync(data)
      .then(function(zip) {
        return zip.file("stdout.txt").async("string");
        // zip.file("hello.txt").async("string"); // a promise of "Hello World\n"
      })
      .then(function(text) {
        console.log(text);
      });
  } catch (error) {
    resultsDownloadError.innerText = error;
  } finally {
    resultsDownloadButton.disabled = false;
  }
};

const init = async () => {
  try {
    let ethProvider;
    let networkVersion;
    if (window.ethereum) {
      console.log("using default provider");
      ethProvider = window.ethereum;
      await ethProvider.enable();
      const { result } = await new Promise((resolve, reject) =>
        ethProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "net_version",
            params: []
          },
          (err, res) => {
            if (!err) resolve(res);
            reject(
              Error(`Failed to get network version from provider: ${err}`)
            );
          }
        )
      );
      networkVersion = result;
    } else {
      console.log("using Portis");
      ethProvider = new Portis("92fb92d5-07f8-463a-91e5-9c6c49fd88e5", "kovan")
        .provider;
      await ethProvider.enable();
      networkVersion = "42";
    }

    if (networkVersion !== "42") {
      const error = `Unsupported network ${networkVersion}, please switch to kovan and refresh`;
      networkOutput.innerText = error;
      throw Error(error);
    }

    networkOutput.innerText = networkVersion;
    const iexec = new IExec({
      ethProvider,
      chainId: networkVersion
    });

    await refreshUser(iexec)();

    accountDepositButton.addEventListener("click", deposit(iexec));
    accountWithdrawButton.addEventListener("click", withdraw(iexec));
    appsShowButton.addEventListener("click", showApp(iexec));
    buyBuyButton.addEventListener("click", buyComputation(iexec));
    previousDealsButton.addEventListener("click", showPreviousDeals(iexec));
    resultsShowDealButton.addEventListener("click", showDeal(iexec));
    resultsShowTaskButton.addEventListener("click", showTask(iexec));
    resultsDownloadButton.addEventListener("click", dowloadResults(iexec));
    accountDepositButton.disabled = false;
    accountWithdrawButton.disabled = false;
    appsShowButton.disabled = false;
    buyBuyButton.disabled = false;
    previousDealsButton.disabled = false;
    resultsShowDealButton.disabled = false;
    resultsShowTaskButton.disabled = false;
    resultsDownloadButton.disabled = false;
    console.log("initialized");
  } catch (e) {
    console.error(e.message);
  }
};

init();
