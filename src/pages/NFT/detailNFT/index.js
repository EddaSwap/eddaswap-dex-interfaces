import Avatar from "@material-ui/core/Avatar";
import CardMedia from "@material-ui/core/CardMedia";
import Link from "@material-ui/core/Link";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import { getNftDetail } from "api/nft";
import Button from "components/Button";
import PanoramaImage from "components/PanoramaImage";
import { NFT_STAKING_ADDRESS } from "constants/address";
import {
  generateNFTsContract,
  generateNFTStakingContract,
  getEarned,
} from "lib/sdk/contract";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { isIOS, isMobile } from "react-device-detect";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { withRouter } from "react-router-dom";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { useStyles } from "./style";
import css from "./styles.module.scss";
import ConfirmRedeemModal from "../components/ConfirmRedeemModal";
import { useDispatch } from "react-redux";
import { openModal } from "actions/app/modal";
import { sendTransaction } from "lib/sendTransaction/v2";
import { useWeb3React } from "@web3-react/core";
import { useWrongNetwork } from "hooks/useWrongNetwork";

const getScreenSize = () => {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
};

const getNftTokenTotalSupply = async (cardId, nftStakeId, callback) => {
  const nftContract = generateNFTsContract();
  try {
    const totalSupply = await nftContract.methods.totalSupply(7).call();
    callback(null, parseFloat(totalSupply));
  } catch (ex) {
    return callback(ex);
  }
};

const getNftTokenMaxSupply = async (cardId, nftStakeId, callback) => {
  const nftContract = generateNFTsContract();

  try {
    var maxSupply = await nftContract.methods.maxSupply(7).call();

    callback(null, parseFloat(maxSupply));
  } catch (ex) {
    return callback(ex);
  }
};

const getViewModal = (card, isMuted) => {
  if (card.is360Image) {
    return (
      <PanoramaImage
        key={`photo-${card.id}-360`}
        _id={`photo-${card.id}-360`}
        url={card.image}
      />
    );
  }

  if (card.isStatic) {
    return (
      <img
        alt={card.description}
        src={card.popupAnimation ? card.popupAnimation : card.animation}
        height={"100%"}
        style={{ background: "#000" }}
      ></img>
    );
  }

  return (
    <ReactPlayer
      url={card.popupAnimation ? card.popupAnimation : card.animation}
      loop={true}
      muted={isMuted}
      playing={!isMobile}
      width={"100%"}
      height={"100%"}
      style={{ background: "#000" }}
      controls
      playsInline
    />
  );
};

const getPlayerHeight = () => {
  const width = getScreenSize().width;

  if (width > 767) {
    return "500px";
  } else return "300px";
};

function DetailNFT() {
  const dispatch = useDispatch();
  const web3Context = useWeb3React();
  const { account, active } = web3Context;
  const wrongNetwork = useWrongNetwork();

  const [isCardPlaying, setIsCardPlaying] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [card, setCard] = useState();
  const [tokenSupply, setTokenSupply] = useState(0);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [tokenMaxSupply, setMaxTokenSupply] = useState(0);
  const [redeeming, setRedeeming] = useState(false);

  const location = useLocation();

  const handleToggleVideoSound = (e) => {
    e.preventDefault();
    setIsMuted(!isMuted);
  };
  const handleToggleModal = () => setIsModalOpened(!isModalOpened);

  const onHoverEnter = () => {
    setIsCardPlaying(!isCardPlaying);
  };

  const onHoverLeave = () => {
    setIsCardPlaying(false);
  };

  const onConfirmRedeemBtnClicked = () => {
    try {
      sendTransaction({
        contract: generateNFTStakingContract(NFT_STAKING_ADDRESS),
        contractAddress: NFT_STAKING_ADDRESS,
        methods: "redeem",
        params: [card.id],
        value: 0.01,
        setLoading: setRedeeming,
        dispatch,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onRedeemBtnClicked = (e) => {
    e.stopPropagation();
    dispatch(
      openModal(
        <ConfirmRedeemModal
          card={card}
          onConfirm={onConfirmRedeemBtnClicked}
          loading={redeeming}
        />
      )
    );
  };

  const loadUserSamuraiBalance = async () => {
    try {
      const contract = generateNFTStakingContract(NFT_STAKING_ADDRESS);
      //load user earned
      const earned = await getEarned(contract, account);
      setEarnedAmount(earned);
    } catch {}
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const idParam = qs.parse(location.search, { ignoreQueryPrefix: true }).id;

    const fetchCardData = async () => {
      let card;
      if (location && location.state) {
        card = location.state;
      } else if (idParam) {
        const cardId = idParam;
        try {
          card = await getNftDetail(cardId);
          const poolId = card && card.pool && card.pool.id;

          if (!poolId) {
            return;
          }

          getNftTokenTotalSupply(cardId, poolId, updateTokenSupplyValue);
          getNftTokenMaxSupply(cardId, poolId, updateTokenMaxSupply);
        } catch (error) {
          return [];
        }
      }
      if (!card) {
        return null;
      }

      if (card.name) {
        document.title = card.name;
      }

      setCard(card);
    };

    fetchCardData();
    loadUserSamuraiBalance();
  }, [account, wrongNetwork]);

  const updateTokenSupplyValue = (error, supply) => {
    setTokenSupply(supply);
  };

  const updateTokenMaxSupply = (error, supply) => {
    setMaxTokenSupply(supply);
  };

  const classes = useStyles();

  if (!card) {
    return <div></div>;
  }
  const viewModal = getViewModal(card, isMuted);

  const url = String(window.location);
  const title = card.name;
  const size = "2rem";
  const isShowOpenSea =
    tokenMaxSupply !== tokenMaxSupply - tokenSupply && tokenMaxSupply;

  return (
    <div className={classes.root}>
      <div className={classes.investedContainer}>
        <div className={classes.container}>
          <div className={css.viewerContainer}>
            <ReactPlayer
              onClick={handleToggleModal}
              url={card.animation}
              loop={true}
              muted={isMuted}
              playing={isCardPlaying}
              width={"100%"}
              height={getPlayerHeight()}
              style={{ background: "#000", borderRadius: "50px" }}
              playsInline
            />

            <CardMedia
              onMouseEnter={
                !card.isStatic && card.animation ? onHoverEnter : null
              }
              onMouseLeave={!card.isStatic ? onHoverLeave : null}
              onClick={card.isStatic ? handleToggleModal : null}
              style={{ opacity: isCardPlaying ? 0 : 1 }}
              className={css.cardMedia}
              image={card.previewImage ? card.previewImage : card.image}
              title={card.description}
              playsInline
              muted
              component={!card.isStatic ? "video" : "div"}
            />
            {card.animation && (
              <>
                {card.isAudio && (
                  <div onClick={handleToggleVideoSound} className={css.volume}>
                    {isMuted ? (
                      <VolumeOffIcon
                        style={{ color: "#fff" }}
                        fontSize="large"
                      />
                    ) : (
                      <VolumeUpIcon
                        style={{ color: "#fff" }}
                        fontSize="large"
                      />
                    )}
                  </div>
                )}

                <div onClick={handleToggleModal} className={css.resize}>
                  <FullscreenIcon style={{ color: "#fff" }} fontSize="large" />
                </div>
              </>
            )}
          </div>
          <div className={css.detailContainer}>
            <h2 className={classes.title}>{card.name}</h2>
            {card.series && (
              <div className={classes.seriesContainer}>
                <div className={classes.seriesIntro}>In series </div>
                <div className={classes.seriesName}>"{card.series}"</div>
              </div>
            )}
            <h3 className={classes.desc}>{card.description}</h3>
            <div className={classes.linkContainer}>
              <div className={classes.linkSubContainer}>
                <div className={classes.shareTextContainer}>
                  <p className={classes.shareText}>Share</p>
                </div>
                <div className={classes.sharingContainer}>
                  <FacebookShareButton
                    quote={
                      "Check out this #NFT from https://www.facebook.com/eddaswap .The best part is that you can own it for free by staking your #EDDA or #EDDA LP tokens - #NFTCollector "
                    }
                    url={url}
                    style={{ padding: "5px" }}
                    className={classes.icon}
                  >
                    <FacebookIcon size={size} round={true} />
                  </FacebookShareButton>

                  <TwitterShareButton
                    title={
                      "Check out this #NFT from @EDDASWAP  ! The best part is that you can own it for free by staking your $EDDA or $EDDA LP tokens - #NFTCollector "
                    }
                    url={url}
                    style={{ padding: "5px" }}
                    className={classes.icon}
                  >
                    <TwitterIcon round={true} size={size} />
                  </TwitterShareButton>

                  <WhatsappShareButton
                    title={`${title}, by EDDASwap `}
                    url={url}
                    separator="- "
                    style={{ padding: "5px" }}
                    className={classes.icon}
                  >
                    <WhatsappIcon size={size} round={true} />
                  </WhatsappShareButton>

                  <LinkedinShareButton
                    title={
                      "Check out this #NFT from https://www.linkedin.com/company/eddaswap .The best part is that you can own it for free by staking your #EDDA or #EDDA LP tokens - #NFTCollector "
                    }
                    url={url}
                    windowWidth={750}
                    windowHeight={600}
                    style={{ padding: "5px" }}
                    className={classes.icon}
                  >
                    <LinkedinIcon size={size} round={true} />
                  </LinkedinShareButton>
                </div>
              </div>
              {card.ipfs_hash && (
                <div className={classes.IPFSLinkContainer}>
                  <div className={classes.ipfsTextContainer}>
                    <p className={classes.ipfsText}>IPFS Link</p>
                  </div>
                  <Link
                    className={classes.viewerContainer}
                    href={"https://ipfs.io/ipfs/" + card.ipfs_hash}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p className={classes.viewText}>View</p>
                  </Link>
                </div>
              )}
            </div>

            {card.artistName && (
              <div className={classes.artist}>
                <Avatar className={classes.artistAvatar}>
                  {card.artistName[0]}
                </Avatar>
                <a
                  href={card.artistTwitter || card.artistInsta}
                  className={classes.artistName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  by {card.artistName}
                </a>
              </div>
            )}
            {isShowOpenSea && (
              <a
                href={`https://opensea.io/assets/0x97c548ac36d5a218bef504b5d5389b724355c5af/${card.id}`}
                rel="noopener noreferrer"
                target="_blank"
                title="Open in OpenSea"
                className={classes.openSeaButton}
              >
                <img
                  src={
                    "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg"
                  }
                  className={css.openSea}
                  alt={"Open in OpenSea"}
                />
                OpenSea
              </a>
            )}
            <div className={classes.attrContainer}>
              <div>
                <p className={classes.titleText}>Type: </p>
                <p className={classes.attrText}>{card.rarity} </p>
              </div>
              <div>
                <p className={classes.titleText}>Point: </p>
                <p className={classes.attrText}>{card.points} Samurai </p>
              </div>
              <br />

              <br />
            </div>
            {earnedAmount >= parseFloat(card.points) && (
              <Button
                className={classes.redeemButton}
                variant="outlined"
                loading={redeeming}
                onClick={onRedeemBtnClicked}
                label="Redeem"
              />
            )}
            <div className={classes.buttonContainer}>
              <div className={classes.cardSupplyRow}>
                <div className={classes.cardSupplyBlock}>
                  <div className={classes.cardSupplyMax}>
                    <div className={classes.cardSupplyValue}>
                      {(card.id === 23 ? 10 : tokenMaxSupply) || 0}
                    </div>
                    <div>total</div>
                  </div>
                  <div className={classes.cardSupplyToken}>
                    <div className={classes.cardSupplyValue}>
                      {tokenMaxSupply - tokenSupply || 0}
                    </div>
                    <div>left</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpened && (
        <>
          <div
            className={css.modal}
            style={!card.isStatic ? { width: "90%", height: "90%" } : {}}
          >
            <button
              onClick={handleToggleModal}
              className={css.modal__close}
              style={{ top: isIOS ? "30px" : "10px" }}
            >
              <CloseIcon style={{ color: "#fff" }} />
            </button>
            {viewModal}
          </div>
          <div onClick={handleToggleModal} className={css.modalWrapper}></div>
        </>
      )}
    </div>
  );
}

export default DetailNFT;
