import "./styles.css";
import Portis from "@portis/web3";
import { IExec } from "iexec";
import base64 from "base-64";

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

const previousDealsButton = document.getElementById("previous-deals-button");
const previousDealsError = document.getElementById("previous-deals-error");
const previousDealsOutput = document.getElementById("previous-deals-output");
/*const resultsDealidInput = document.getElementById("results-dealid-input");

const resultsShowDealButton = document.getElementById(
  "results-showdeal-button"
);
const resultsShowDealError = document.getElementById("results-showdeal-error");
const resultsShowDealOutput = document.getElementById(
  "results-dealdetails-output"
);
*/
const resultsTaskidInput = document.getElementById("results-taskid-input");
const resultsShowTaskButton = document.getElementById(
  "results-showtask-button"
);
const resultsShowTaskError = document.getElementById("results-showtask-error");
const resultsShowTaskOutput = document.getElementById(
  "results-taskdetails-output"
);

const resultsDownloadInput1 = document.getElementById(
  "results-download-input-1"
);
const resultsDownloadInput2 = document.getElementById(
  "results-download-input-2"
);
const resultsDownloadInput3 = document.getElementById(
  "results-download-input-3"
);

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
    if (!buyParamsInput1.value.startsWith('https')) {
      throw new Error('Please provide a github http URL eg. https://github.com/maggo/decentralify.git')
    }
    const buyParamsInput =
      buyParamsInput1.value +
      " " +
      buyParamsInput2.value +
      " " +
      buyParamsInput3.value;
    const params = buyParamsInput;
    console.log(params);
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
    console.log(res);
    //resultsDealidInput.value = res.dealid;

    const task = await iexec.deal.computeTaskId(res.dealid, 0);
    console.log(task);

    resultsTaskidInput.value = task;
    resultsDownloadInput1.value = task;
    refreshUser(iexec)();
  } catch (error) {
    buyBuyError.innerText = error;
  } finally {
    buyBuyButton.disabled = false;
  }
};

const showTask = iexec => async () => {
  try {
    resultsShowTaskButton.disabled = true;
    resultsShowTaskError.innerText = "";
    resultsShowTaskOutput.innerText = "";
    const taskid = resultsTaskidInput.value;
    const res = await iexec.task.show(taskid);
    const status = res.statusName;
    //resultsShowTaskOutput.innerText = JSON.stringify(res, null, 2);
    resultsShowTaskOutput.innerText = status;
  } catch (error) {
    resultsShowTaskError.innerText = error;
  } finally {
    resultsShowTaskButton.disabled = false;
  }
};

const deploy = iexec => async taskId => {
  try {
    if (taskId) {
      resultsDownloadInput1.value = taskId;
    }

    resultsDownloadButton.disabled = true;
    resultsDownloadError.innerText = "";

    console.log(
      resultsDownloadInput1.value,
      resultsDownloadInput2.value,
      resultsDownloadInput3.value
    );

    if (
      !resultsDownloadInput1.value ||
      !resultsDownloadInput2.value ||
      !resultsDownloadInput3.value
    ) {
      throw new Error("Please provide task, username and password");
    }

    const taskid = resultsDownloadInput1.value;
    const res = await iexec.task.fetchResults(taskid, {
      ipfsGatewayURL: "https://ipfs.iex.ec"
    });
    const file = await res.blob();

    function blob2data(blob) {
      const fd = new FormData();
      fd.set("a", blob);
      return fd.get("a");
    }
    const rawData = blob2data(file);

    const JSZip = require("jszip");
    const zip = new JSZip();
    const data = await zip.loadAsync(rawData);

    const stdFile = data.file("stdout.txt");
    const stdText = await stdFile.async("string");

    document.getElementById('build-output').innerText = stdText;
    
    const zipFile = data.file("iexec_out/ipfs-cid.txt");
    if (!zipFile) {
      throw new Error('Oops looks like the IPFS upload failed…');
    }
    const text = await zipFile.async("string");

    const ipfsCid = text.slice(6, -2);
    console.log(ipfsCid);

    if (!ipfsCid) {
      throw new Error('Oops looks like the IPFS upload failed…');
    }

    resultsDownloadError.innerText = "Your IPFS CID is " + ipfsCid + "\n";

    let headers = new Headers();
    headers.append(
      "Authorization",
      "Basic " +
        base64.encode(
          resultsDownloadInput2.value + ":" + resultsDownloadInput3.value
        )
    );

    const response = await fetch("https://runfission.com/dns/" + ipfsCid, {
      method: "PUT",
      headers
    });

    if (!response.ok) {
      throw new Error("There was an error with FISSION. Wrong credentials?");
    }

    const url = await response.text();

    console.log(url);

    resultsDownloadError.innerText +=
      " Deployed at https://" + url + "! It will be available any minute 🎉";
  } catch (error) {
    resultsDownloadError.innerText = error;
  } finally {
    resultsDownloadButton.disabled = false;
  }
};

const showOutput = iexec => async taskId => {
  try {
    if (!taskId) {
      throw new Error('No task id')
    }

    const res = await iexec.task.fetchResults(taskId, {
      ipfsGatewayURL: "https://ipfs.iex.ec"
    });
    const file = await res.blob();

    function blob2data(blob) {
      const fd = new FormData();
      fd.set("a", blob);
      return fd.get("a");
    }
    const rawData = blob2data(file);

    const JSZip = require("jszip");
    const zip = new JSZip();
    const data = await zip.loadAsync(rawData);

    const stdFile = data.file("stdout.txt");
    const stdText = await stdFile.async("string");

    document.getElementById('build-output').innerText = stdText;
    window.scrollTo(document.getElementById('build-output'));
  } catch (e) {
    document.getElementById('build-output').innerText = e;
  }
};


const showPreviousDeals = iexec => async () => {
  try {
    previousDealsButton.disabled = true;
    previousDealsError.innerText = "";
    previousDealsOutput.innerText = "";
    const userAddress = await iexec.wallet.getAddress();
    const deals = await iexec.deal.fetchRequesterDeals(userAddress);

    previousDealsOutput.innerHTML = deals.count + " build(s)<br />";

    Array.from(deals.deals)
      .sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
      .forEach(async function(deal) {
        try {
          const task = await iexec.deal.computeTaskId(deal.dealid, 0);
          const taskDetails = await iexec.task.show(task);

          const button = document.createElement("button");
          button.innerText = "Deploy";
          button.addEventListener("click", function() {
            deploy(iexec)(task);
          });

          const showButton = document.createElement("button");
          showButton.innerText = "Show output";
          showButton.addEventListener("click", function() {
            showOutput(iexec)(task);
          });

          const container = document.createElement("div");
          container.innerHTML = `
        ID: ${task}<br />
        Start: ${new Date(deal.startTime * 1000)}
        Status: ${taskDetails.statusName}<br />
        `;

          if (taskDetails.statusName === "COMPLETED") {
            container.appendChild(button);

            container.appendChild(showButton);
          }

          container.style = `border-color: ${
            taskDetails.statusName === "ACTIVE"
              ? "blue"
              : taskDetails.statusName === "COMPLETED"
              ? "green"
              : taskDetails.statusName === "REVEALING"
              ? "blue"
              : "red"
          };`;
          container.className = "container build";

          previousDealsOutput.appendChild(container);
        } catch (e) {
          const container = document.createElement("div");
          container.innerHTML = `
        ID: …<br />
        Status: WAITING<br />
        `;

          container.style = `border-color: yellow;`;
          container.className = "container build";

          previousDealsOutput.appendChild(container);
        }
      });

    //previousDealsOutput.innerText = JSON.stringify(deals, null, 2);
  } catch (error) {
    previousDealsError.innerText = error;
  } finally {
    previousDealsButton.disabled = false;
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
    /*
    resultsShowDealButton.addEventListener("click", showDeal(iexec));
    */
    resultsShowTaskButton.addEventListener("click", showTask(iexec));
    resultsDownloadButton.addEventListener("click", () => deploy(iexec)());
    accountDepositButton.disabled = false;
    accountWithdrawButton.disabled = false;
    appsShowButton.disabled = false;
    buyBuyButton.disabled = false;
    previousDealsButton.disabled = false;
    /*
    resultsShowDealButton.disabled = false;
    */
    resultsShowTaskButton.disabled = false;
    resultsDownloadButton.disabled = false;
    console.log("initialized");

    await showPreviousDeals(iexec)();
  } catch (e) {
    console.error(e.message);
  }
};

init();
