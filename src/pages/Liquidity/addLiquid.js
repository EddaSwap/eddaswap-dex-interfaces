import React from "react";
import Card from "components/Card";
import Button from "components/Button";
import Settings from "components/Settings";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { openModal, closeModal } from "actions/app/modal";
import PositionCard from "components/PositionCard";
import { IoSettingsOutline } from "react-icons/io5";
import { withTranslation } from "react-i18next";
import { loadLpTokenList } from "actions/liquidity/liquidityPool";

class AddLiquidity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      v2Pair: [],
      loading: true,
      importedPoolList: props.importedPoolList,
    };
  }
  componentDidMount() {
    if (this.props.account) {
      this.loadBalance();
      this.props.loadLpTokenList();
    }
  }
  componentDidUpdate(prevProps) {
    if (
      prevProps.account !== this.props.account ||
      prevProps.userLpTokensBalance !== this.props.userLpTokensBalance ||
      prevProps.userBalances !== this.props.userBalances
    ) {
      this.loadBalance();
    }
    if (prevProps.importedPoolList !== this.props.importedPoolList) {
      this.props.loadLpTokenList();
    }
  }
  renderSettingsModal() {
    return <Settings />;
  }
  onSettingClick = () => {
    this.props.openModal(this.renderSettingsModal());
  };
  async loadBalance() {
    try {
      const { userLpTokensBalance } = this.props;
      this.setState({ v2Pair: userLpTokensBalance, loading: false });
    } catch (error) {
      console.error("Failed to load tracked token pair balance", error);
      this.setState({ loading: false });
    }
  }
  renderLiquidList() {
    const { loadedData, t } = this.props;
    const { v2Pair, loading } = this.state;
    return (
      <div className="liquid-list">
        {!loadedData || loading ? (
          <div className="no-connect-view">
            <span className="note">{t("component.dropdown.loading")}</span>
          </div>
        ) : v2Pair && v2Pair.length > 0 ? (
          <div>
            {v2Pair.map((pair) => {
              return (
                <div className="pointer" key={pair.liquidityToken.address}>
                  <PositionCard pair={pair} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-connect-view">
            <span className="note">{t("liquidity.noLiquidityFound")}</span>
          </div>
        )}
        <span>
          {t("liquidity.remove.donttSeePool")}{" "}
          <Link
            to={{ pathname: "/find", query: { previousLink: "/addLiquid" } }}
          >
            {t("liquidity.remove.importPool")}
          </Link>
        </span>
      </div>
    );
  }
  render() {
    const { account, wrongNetwork, t } = this.props;
    return (
      <div className="add-liquidity">
        <div className="row flex justify-content-center">
          <div className="col-lg-5 col-md-12">
            <Card>
              <div className="add-card-header">
                <div>
                  <h3>{t("liquidity.title")}</h3>
                  <span className="desc">{t("liquidity.addLiquidity")}</span>
                </div>
                <div className="pointer" onClick={this.onSettingClick}>
                  <IoSettingsOutline className="icons" size={25} />
                </div>
              </div>
              <br />
              <Link to="/add/">
                <Button className="add-btn">
                  {t("liquidity.add.addLiquidity")}
                </Button>
              </Link>
              <hr />
              <div>
                <span className="bolder">{t("liquidity.yourLiquidity")}</span>
                <div className="liquid-list">
                  {account && !wrongNetwork ? (
                    <div>{this.renderLiquidList()}</div>
                  ) : (
                    <div className="no-connect-view">
                      <span className="note">
                        {t("liquidity.remove.connectWallet")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => {
    return {
      account: state.api.wallet.account,
      wrongNetwork: state.api.wallet.wrongNetwork,
      liquidityList: state.api.liquidity.liquidityList,
      loadedData: state.api.common.loadedData,
      lpTokenPairs: state.api.liquidity.lpTokenPairs,
      userLpTokensBalance: state.api.liquidity.userLpTokensBalance,
      userBalances: state.api.liquidity.userBalances,
      importedPoolList: state.api.liquidity.importedPoolList,
    };
  },
  { openModal, closeModal, loadLpTokenList }
)(withTranslation()(AddLiquidity));
