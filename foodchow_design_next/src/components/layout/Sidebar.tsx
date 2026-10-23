// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { NAV_SECTIONS, type NavSection } from "@/constants/navigation";
// import { cn } from "@/utils";
// import styles from "./shell.module.css";

// /** Resolve the active section from the current pathname (falls back to the first). */
// function getActiveSection(pathname: string): NavSection {
//   const match = NAV_SECTIONS.find((section) =>
//     section.items.some((item) => item.href !== "#" && pathname.startsWith(item.href))
//   );
//   return match ?? NAV_SECTIONS[0];
// }

// /** First navigable item of a section — the outer icon links here (as in index.html). */
// function firstHref(section: NavSection): string {
//   const navigable = section.items.find((item) => item.href !== "#");
//   return navigable?.href ?? "#";
// }

// /**
//  * Dual sidebar: outer icon rail (sections) + inner submenu (active section items).
//  * Active state is derived from the route instead of imperative class toggling.
//  */
// export function Sidebar() {
//   const pathname = usePathname();
//   const activeSection = getActiveSection(pathname);

//   return (
//     <>
//       {/* Outer Sidebar */}
//       <div className={styles.sidebarOuter}>
//         {NAV_SECTIONS.map((section) => (
//           <Link
//             key={section.key}
//             href={firstHref(section)}
//             className={cn(
//               styles.menuItem,
//               section.key === activeSection.key && styles.active
//             )}
//           >
//             <i className={section.icon} />
//             <span>{section.label}</span>
//           </Link>
//         ))}
//       </div>

//       {/* Inner Sidebar */}
//       <div className={styles.sidebarInner}>
//         <div className={styles.shopInfoWrapper}>
//           <div className={styles.shopInfo}>
//             <i className="fas fa-store" />
//             Maharaja Food
//           </div>
//         </div>

//         <ul className={cn(styles.submenu, styles.active)}>
//           {activeSection.items.map((item) => {
//             const isActive = item.href !== "#" && pathname.startsWith(item.href);
//             const className = cn(styles.submenuItem, isActive && styles.active);
//             return (
//               <li key={item.label}>
//                 {item.href === "#" ? (
//                   <a href="#" className={className} onClick={(e) => e.preventDefault()}>
//                     <i className={item.icon} /> {item.label}
//                   </a>
//                 ) : (
//                   <Link href={item.href} className={className}>
//                     <i className={item.icon} /> {item.label}
//                   </Link>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_SECTIONS, type NavSection } from "@/constants/navigation";
import { cn } from "@/utils";
import styles from "./shell.module.css";
import { setupService } from "@/api/services/setup.service";
import { LanguageIcon } from "./LanguageIcon";
import { SupportedLanguagesModal } from "./SupportedLanguagesModal";

/** Resolve the active section from the current pathname (falls back to the first). */
function getActiveSection(pathname: string): NavSection {
  const match = NAV_SECTIONS.find((section) =>
    section.items.some((item) => item.href !== "#" && pathname.startsWith(item.href))
  );
  return match ?? NAV_SECTIONS[0];
}

/** First navigable item of a section — the outer icon links here (as in index.html). */
function firstHref(section: NavSection): string {
  const navigable = section.items.find((item) => item.href !== "#");
  return navigable?.href ?? "#";
}

/**
 * Dual sidebar: outer icon rail (sections) + inner submenu (active section items).
 * Active state is derived from the route instead of imperative class toggling.
 */
export function Sidebar() {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);
  const router = useRouter();
  const [shopName, setShopName] = useState("Loading...");
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  useEffect(() => {
    const fetchShopInfo = async () => {
      const shopId = sessionStorage.getItem("shop_id");
      if (shopId) {
        try {
          const info = await setupService.getRestaurantInformation(Number(shopId));
          if (info && info.shop_name) {
            setShopName(info.shop_name);
            if (info.shoplogo) {
              setShopLogo(info.shoplogo);
            }
          } else {
            setShopName("Unknown Restaurant");
          }
        } catch (error) {
          console.error("Failed to fetch shop info:", error);
          setShopName("Unknown Restaurant");
        }
      } else {
        setShopName("Guest");
      }
    };
    fetchShopInfo();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("shop_id");
    router.replace("/login");
  };

  return (
    <>
      {/* Outer Sidebar */}
      <div className={styles.sidebarOuter}>
        {NAV_SECTIONS.map((section) => (
          <Link
            key={section.key}
            href={firstHref(section)}
            className={cn(
              styles.menuItem,
              section.key === activeSection.key && styles.active
            )}
          >
            <i className={section.icon} />
            <span>{section.label}</span>
          </Link>
        ))}

        {/* Supported Languages Modal Trigger - placed directly near Support button */}
        <button
          type="button"
          className={cn(
            styles.menuItem,
            styles.languageBtn,
            isLanguageModalOpen && styles.active
          )}
          onClick={() => setIsLanguageModalOpen(true)}
          title="Change Languages / Supported Languages"
        >
          <LanguageIcon size={24} />
          <span>Language</span>
        </button>

        {/* Logout Button directly below Language */}
        <button
          type="button"
          className={cn(styles.menuItem, styles.logoutBtn)}
          onClick={handleLogout}
          title="Log Out"
        >
          <i className="fas fa-sign-out-alt" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Global Supported Languages Modal */}
      <SupportedLanguagesModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />


      {/* Inner Sidebar */}
      <div className={styles.sidebarInner}>
        <div className={styles.shopInfoWrapper}>
          <div className={styles.shopInfo}>
            {shopLogo ? (
              <img
                src={`https://admin.foodchow.com/LogoImages/${shopLogo}`}
                alt="Shop Logo"
                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <i className="fas fa-store" />
            )}
            {shopName}
          </div>
        </div>

        <ul className={cn(styles.submenu, styles.active)}>
          {activeSection.items.map((item) => {
            const isActive = item.href !== "#" && pathname.startsWith(item.href);
            const className = cn(styles.submenuItem, isActive && styles.active);
            return (
              <li key={item.label}>
                {item.href === "#" ? (
                  <a href="#" className={className} onClick={(e) => e.preventDefault()}>
                    <i className={item.icon} /> {item.label}
                  </a>
                ) : item.href.startsWith("http") ? (
                  <a href={item.href} className={className} target="_blank" rel="noopener noreferrer">
                    <i className={item.icon} /> {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={className}>
                    <i className={item.icon} /> {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}