"use client";

import { useState } from "react";

export const GiftButton = () => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		if (isOpen) return;
		setIsOpen(true);

		setTimeout(() => {
			window.location.href = "/profile";
		}, 800);
	};

	return (
		<>
			<style>
				{`
					/* --- Animations --- */

					@keyframes lidLift {
						0% {
							transform: translateX(0) translateY(0) rotateX(0deg) rotateZ(0deg);
							opacity: 1;
						}
						40% {
							transform: translateX(-4px) translateY(-8px) rotateX(-12deg) rotateZ(-4deg);
							opacity: 1;
						}
						100% {
							transform: translateX(-14px) translateY(-55px) rotateX(-26deg) rotateZ(-10deg);
							opacity: 0;
						}
					}

					@keyframes boxShake {
						0%, 100% { transform: translateX(0) rotateZ(0deg); }
						25%      { transform: translateX(-3px) rotateZ(-1deg); }
						50%      { transform: translateX(3px) rotateZ(1deg); }
						75%      { transform: translateX(-2px) rotateZ(-1deg); }
					}

					@keyframes ribbonPullLeft {
						0%   { transform: translateX(0);     opacity: 1; }
						60%  { transform: translateX(-90%); opacity: 0.4; }
						100% { transform: translateX(-150%); opacity: 0; }
					}

					@keyframes ribbonPullDown {
						0%   { transform: translateY(0);     opacity: 1; }
						60%  { transform: translateY(90%);  opacity: 0.4; }
						100% { transform: translateY(150%); opacity: 0; }
					}

					@keyframes bowPopOff {
						0% {
							transform: translate(-50%, 0) rotateZ(0deg);
							opacity: 1;
						}
						60% {
							transform: translate(-60%, -14px) rotateZ(-10deg);
							opacity: 0.6;
						}
						100% {
							transform: translate(-75%, -26px) rotateZ(-16deg);
							opacity: 0;
						}
					}

					/* --- Button shell --- */
					.gift-button {
						width: 120px;
						height: 120px;
						border: none;
						background: transparent;
						cursor: pointer;
						padding: 0;
						transition: transform 0.25s ease, filter 0.25s ease;
					}

					.gift-button:hover:not(.opened) {
						transform: scale(1.05) translateY(-2px);
						filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25));
					}

					.gift-button:active:not(.opened) {
						transform: scale(0.97) translateY(1px);
					}

					/* --- Box wrapper --- */
					.gift-box {
						position: relative;
						width: 100%;
						height: 100%;
					}

					.gift-box.opened {
						animation: boxShake 0.4s ease-in-out;
					}

					/* --- Box body --- */
					.gift-body {
						position: absolute;
						left: 14px;
						right: 14px;
						top: 40px;
						bottom: 12px;
						background: linear-gradient(
							to bottom,
							#dc2626 0%,
							#b91c1c 45%,
							#a31414 100%
						);
						box-shadow:
							0 10px 18px rgba(0,0,0,0.32),
							inset 0 1px 0 rgba(255,255,255,0.18),
							inset 0 -8px 10px rgba(0,0,0,0.35);
					}

					.gift-body::before {
						content: "";
						position: absolute;
						left: 34%;
						right: 34%;
						top: 4px;
						bottom: 6px;
						background: linear-gradient(
							to right,
							rgba(0,0,0,0.15),
							rgba(255,255,255,0.12),
							rgba(0,0,0,0.25)
						);
						opacity: 0.3;
					}

					/* --- Lid --- */
					.gift-lid {
						position: absolute;
						left: 12px;
						right: 12px;
						top: 18px;
						height: 22px;
						background: linear-gradient(
							to bottom,
							#ef4444 0%,
							#dc2626 65%
						);
						box-shadow: 0 5px 0 #7f1d1d, 0 9px 14px rgba(0,0,0,0.26);
						transform-origin: 50% 100%;
						z-index: 2;
					}

					.gift-lid::after {
						content: "";
						position: absolute;
						left: -1px;
						right: -1px;
						bottom: -4px;
						height: 5px;
						background: rgba(0,0,0,0.45);
					}

					.gift-lid.opened {
						animation: lidLift 0.7s ease-out forwards;
					}

					/* --- Ribbons --- */

					.ribbon-vertical {
						position: absolute;
						top: 18px;
						bottom: 12px;
						left: 50%;
						transform: translateX(-50%);
						width: 16px;
						background: linear-gradient(
							to bottom,
							#fef9c3 0%,
							#fde047 40%,
							#f59e0b 100%
						);
						box-shadow:
							inset 0 0 0 1px rgba(255,255,255,0.7),
							0 3px 4px rgba(0,0,0,0.25);
						z-index: 3;
					}

					.ribbon-vertical.opened {
						animation: ribbonPullDown 0.28s ease-out forwards;
					}

					.ribbon-horizontal {
						position: absolute;
						left: 14px;
						right: 14px;
						top: 60px;
						height: 12px;
						background: linear-gradient(
							to right,
							#fef9c3 0%,
							#fde047 40%,
							#f59e0b 100%
						);
						box-shadow:
							inset 0 0 0 1px rgba(255,255,255,0.7),
							0 3px 4px rgba(0,0,0,0.25);
						z-index: 3;
					}

					.ribbon-horizontal.opened {
						animation: ribbonPullLeft 0.25s ease-out forwards;
					}

					/* --- Bow (icon-style) --- */

					.bow {
						position: absolute;
						top: 10px;
						left: 50%;
						width: 44px;
						height: 24px;
						transform: translateX(-50%);
						z-index: 4;
						pointer-events: none;
					}

					.bow.opened {
						animation: bowPopOff 0.3s ease-out forwards;
					}

					/* circular loops behind the knot */
					.bow-loop {
						position: absolute;
						top: -8px; 
						width: 20px;
						height: 20px;
						border-radius: 999px;
						background: linear-gradient(
							135deg,
							#fff8cf 0%,
							#fbd34d 45%,
							#f59e0b 100%
						);
						box-shadow:
							inset 0 1px 2px rgba(255,255,255,0.75),
							0 2px 4px rgba(0,0,0,0.28);
					}

					.bow-loop.left {
						left: 1px;
						transform: translateY(2px) rotate(-8deg);
						transform-origin: 100% 60%;
					}

					.bow-loop.right {
						right: 1px;
						transform: translateY(2px) rotate(8deg);
						transform-origin: 0% 60%;
					}

					/* center circular knot with light ring */
					.bow-knot {
						position: absolute;
						left: 50%;
						top: 0;
						width: 18px;
						height: 18px;
						transform: translateX(-50%);
						border-radius: 999px;
						background: radial-gradient(
							circle at 30% 20%,
							#fffdf0 0%,
							#fde68a 35%,
							#fbbf24 70%,
							#f59e0b 100%
						);
						box-shadow:
							inset 0 0 0 1px rgba(255,255,255,0.9),
							0 2px 4px rgba(0,0,0,0.3);
					}
				`}
			</style>

			<button
				type="button"
				onClick={handleClick}
				className={`gift-button ${isOpen ? "opened" : ""}`}
				aria-label="Open gift"
			>
				<div className={`gift-box ${isOpen ? "opened" : ""}`}>
					<div className={`gift-lid ${isOpen ? "opened" : ""}`} />

					<div className={`ribbon-vertical ${isOpen ? "opened" : ""}`} />
					<div className={`ribbon-horizontal ${isOpen ? "opened" : ""}`} />

					<div className={`bow ${isOpen ? "opened" : ""}`}>
						<div className="bow-loop left" />
						<div className="bow-loop right" />
						<div className="bow-knot" />
					</div>

					<div className="gift-body" />
				</div>
			</button>
		</>
	);
};
