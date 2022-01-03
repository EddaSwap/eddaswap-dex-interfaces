import React, { useEffect, useState } from 'react';
import { getIcon } from 'lib/imageHelper';
import axios from 'axios';
import {
  loadEDDAStaking,
  loadEDDANFTStaking,
  loadEDDALPNFT,
  loadEDDAUNIReward,
  loadEDDALPTokenTotalSupply,
  loadEDDALPTokenResevers,
} from 'lib/ethNetwork/eddaStaked';
import { plus, dividedBy, times, truncate } from 'lib/numberHelper';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';

const footerMenuList = [
  { title: 'Twitter', link: 'https://twitter.com/EDDASWAP', icon: 'twitter' },
  { title: 'Telegram', link: 'https://t.me/EDDASwap', icon: 'telegram' },
];

const EDDA_ADDRESS = '0xFbbE9b1142C699512545f47937Ee6fae0e4B0aA9';

function Footer() {
  const { t } = useTranslation();

  const [eddaPrice, setEddaPrice] = useState(0);
  const [eddaStaked, setEddaStaked] = useState(0);
  const [eddaUniLP, setEddaUniLP] = useState(0);
  const [ethPrice, setETHPrice] = useState(0);
  useEffect(() => {
    fetchEddaPrice();
    fetchStakingData();
  });

  const fetchStakingData = async () => {
    const eddaTotalSupply = await loadEDDAStaking();
    const eddaNFTTotalSupply = await loadEDDANFTStaking();
    const eddaStaked = dividedBy(
      plus(eddaTotalSupply, eddaNFTTotalSupply),
      5000
    );
    setEddaStaked(eddaStaked);

    const eddaLPTotalSupply = await loadEDDALPNFT();
    const eddaUNITotalSupply = await loadEDDAUNIReward();
    const eddaLpTokenTotalSupply = await loadEDDALPTokenTotalSupply();

    setEddaUniLP(
      dividedBy(
        plus(eddaLPTotalSupply, eddaUNITotalSupply),
        eddaLpTokenTotalSupply
      )
    );
  };
  const fetchEddaPrice = async () => {
    try {
      const reserves = await loadEDDALPTokenResevers();
      const reserveETH = reserves[0];
      const reserveEDDA = reserves[1];
      const ethPriceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
      );

      if (ethPriceResponse && ethPriceResponse.status === 200) {
        const data = ethPriceResponse.data;
        const price = data?.ethereum?.usd;
        price && setETHPrice(price);
        setEddaPrice((price * reserveETH) / reserveEDDA);
      }

      // const priceResponse = await axios.get(
      //   `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${EDDA_ADDRESS}&vs_currencies=usd`
      // );
      // console.log('priceResponse', priceResponse);
      // if (priceResponse && priceResponse.status === 200) {
      //   const data = priceResponse.data;
      //   const price = data[EDDA_ADDRESS.toLowerCase()]?.usd;
      //   price && setEddaPrice(price);
      // }
    } catch (error) {
      console.error('Failed to fetch edda price', error);
    }
  };
  return (
    <div className="footer">
      <hr />
      <div className="footer-container flex justify-content-space-between">
        <div className="col-lg-10 col-md-8 footer-edda-details-container">
          <div className="footer-edda-details-row flex justify-content-space-between">
            <span className="footer-edda-details-key">
              {t('footer.info.price')}:{' '}
            </span>
            <span className="footer-edda-details-value">
              ${parseFloat(eddaPrice).toFixed(2)}
            </span>
            {/* <span className="footer-edda-details-value">$680</span> */}
          </div>
          <div className="footer-edda-details-row flex justify-content-space-between">
            <span className="footer-edda-details-key">
              {t('footer.info.staking')}:{' '}
            </span>
            <span className="footer-edda-details-value">
              {truncate(times(eddaStaked, 100), 2)}%
            </span>
          </div>
          <div className="footer-edda-details-row flex justify-content-space-between">
            <span className="footer-edda-details-key">
              Uniswap EDDA LP Staked:{' '}
            </span>
            <span className="footer-edda-details-value">
              {truncate(times(eddaUniLP, 100), 2)}%
            </span>
          </div>
        </div>
        <div
          className={`col-lg-2 col-md-4 flex ${
            isMobile ? 'justify-content-flex-start' : 'justify-content-flex-end'
          }`}
        >
          {footerMenuList.map((item, index) => {
            return (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                style={
                  isMobile
                    ? { marginRight: '3rem', display: 'inline-block' }
                    : { marginLeft: '3rem', display: 'inline-block' }
                }
              >
                {getIcon(`icon-${item.icon}`)}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Footer;
