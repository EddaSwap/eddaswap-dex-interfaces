import { Card } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import { openModal } from "actions/app/modal";
import Button from "components/Button";
import PanoramaImage from "components/PanoramaImage";
import { NFT_STAKING_ADDRESS } from "constants/address";
import { getIcon } from "lib/imageHelper";
import { generateNFTStakingContract } from "lib/sdk/contract";
import { sendTransaction } from "lib/sendTransaction/v2";
import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import ReactPlayer from "react-player/lazy";
import { useDispatch } from "react-redux";
import { useNFTCardStyles } from "../style";
import ConfirmRedeemModal from "./ConfirmRedeemModal";
import { useHistory } from "react-router-dom";

const getSubHeaderInfo = (card) => {
  return (
    <div>
      <div>{card.rarity}</div>
      <div
        style={{
          color: "#870FE5",
          paddingTop: "2px",
          fontStyle: "italic",
          fontWeight: 600,
        }}
      >
        {card.series}
      </div>
    </div>
  );
};

const getArtistInfo = (card, classes) => {
  if (!card.artistName) {
    return null;
  }
  return (
    <CardActions disableSpacing className={classes.cardArtist}>
      <div className={classes.artistName}>by {card.artistName}</div>
      {card.artistInsta && (
        <a
          href={card.artistInsta}
          target="_blank"
          className={classes.socialContainer}
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer"
        >
          {getIcon("icon-instagram")}
        </a>
      )}
      {card.artistTwitter && (
        <a
          href={card.artistTwitter}
          target="_blank"
          className={classes.socialContainer}
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer"
        >
          {getIcon("icon-twitter")}
        </a>
      )}
    </CardActions>
  );
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
const DESC_LIMIT = 70;
const formatDesc = (desc) => {
  if (!desc) {
    return "...";
  }

  if (desc.length <= DESC_LIMIT) {
    return desc;
  }
  return desc.substring(0, DESC_LIMIT) + "...";
};

function NftCard(props) {
  const { card = {} } = props;
  const [isCardPlaying, setIsCardPlaying] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const handleToggleVideoSound = (e) => {
    e.preventDefault();
    setIsMuted(!isMuted);
  };

  const handleToggleModal = () => setIsModalOpened(!isModalOpened);

  const onHoverEnter = () => {
    setIsCardPlaying(true);
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

  const { onClick, rewardsAvailable } = props;

  const _styles = useNFTCardStyles();
  const classes = useNFTCardStyles();
  const viewModal = getViewModal(card, isMuted);

  const onCardClick = () => {
    history.push(`/nft-detail?id=${card.id}`);
  };

  return (
    <>
      <Card
        key={"card_" + card.id}
        className={classes.cardRoot}
        onClick={onCardClick}
      >
        <ReactPlayer
          onClick={handleToggleModal}
          url={card.animation}
          loop={true}
          muted={isMuted}
          playing={isCardPlaying}
          width={"100%"}
          height={"380px"}
          style={{ background: "#000" }}
          playsInline
        />

        <CardMedia
          onMouseEnter={!card.isStatic && card.animation ? onHoverEnter : null}
          onMouseLeave={!card.isStatic ? onHoverLeave : null}
          onClick={card.isStatic ? handleToggleModal : null}
          style={{ opacity: isCardPlaying ? 0 : 1 }}
          className={classes.cardMedia}
          image={card.previewImage ? card.previewImage : card.image}
          title={card.description}
          playsInline
          muted
          component={!card.isStatic ? "video" : "div"}
        />

        {!!card.animation && (
          <>
            {card.isAudio && (
              <div onClick={handleToggleVideoSound} className={classes.volume}>
                {isMuted ? (
                  <VolumeOffIcon style={{ color: "#fff" }} />
                ) : (
                  <VolumeUpIcon style={{ color: "#fff" }} />
                )}
              </div>
            )}

            <div onClick={handleToggleModal} className={classes.resize}>
              <FullscreenIcon style={{ color: "#fff" }} />
            </div>
          </>
        )}
        <div onClick={onClick}>
          <div className={classes.cardSupplyRow}>
            <div className={classes.cardSupplyBlock}>
              <div className={classes.cardSupplyMax}>
                <div className={classes.cardSupplyValue}>
                  {(card.id === 23 ? 10 : card.tokenMaxSupply) || 0}
                </div>
                <div>total</div>
              </div>
              <div className={classes.cardSupplyToken}>
                <div className={classes.cardSupplyValue}>
                  {card.tokenMaxSupply - card.tokenSupply || 0}
                </div>
                <div>left</div>
              </div>
            </div>
          </div>

          <CardHeader
            avatar={
              <Avatar aria-label="collection" className={classes.cardAvatar}>
                <img alt="" src={"/icons/nft-collection-1.svg"} />
              </Avatar>
            }
            // action={
            //   <IconButton aria-label="settings">
            //     <MoreVertIcon />
            //   </IconButton>
            // }
            title={card.name}
            subheader={getSubHeaderInfo(card, classes)}
            classes={{
              title: classes.cardHeaderTitle,
              subheader: classes.cardHeaderSubheader,
            }}
            style={{
              minHeight: "88px",
              padding: "12px",
            }}
          />

          <CardContent className={classes.cardContent}>
            {formatDesc(card.description)}
          </CardContent>

          <CardActions disableSpacing className={classes.cardActions}>
            <div>{card.points} Samurai</div>
            {rewardsAvailable >= parseFloat(card.points) && (
              <Button
                className={classes.redeemButton}
                variant="outlined"
                loading={redeeming}
                onClick={onRedeemBtnClicked}
                label="Redeem"
              />
            )}
          </CardActions>
          {getArtistInfo(card, classes)}
        </div>
      </Card>
      {isModalOpened && (
        <>
          <div
            className={classes.modal}
            style={!card.isStatic ? _styles.animationModal : {}}
          >
            <button
              onClick={handleToggleModal}
              className={classes.modal__close}
            >
              <CloseIcon style={{ color: "#fff" }} />
            </button>
            {viewModal}
          </div>
          <div
            onClick={handleToggleModal}
            className={classes.modalWrapper}
          ></div>
        </>
      )}
    </>
  );
}

export default NftCard;
