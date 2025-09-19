import styles from "./page.module.css";
import MainContainer from "@/components/MainContainer/MainContainer";

export default function Home() {
  return (
    <main className={styles.main}>
      <MainContainer />
    </main>
  );
}
