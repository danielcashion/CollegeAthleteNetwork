import Image from "next/image";

export const CAN_EVENTS_APP_STORE_URL =
  "https://apps.apple.com/us/app/can-events/id6817085169";

const BADGE_SRC = "/images/can-events/download-on-app-store.png";

type AppStoreDownloadBadgeProps = {
  className?: string;
};

export default function AppStoreDownloadBadge({ className = "" }: AppStoreDownloadBadgeProps) {
  return (
    <a
      href={CAN_EVENTS_APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition opacity-95 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C315F] ${className}`}
      aria-label="Download CAN Events on the App Store"
    >
      <Image
        src={BADGE_SRC}
        alt="Download on the App Store"
        width={180}
        height={54}
        className="h-10 w-auto sm:h-11"
        priority={false}
      />
    </a>
  );
}
