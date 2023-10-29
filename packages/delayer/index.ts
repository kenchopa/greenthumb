export default async function sleep(ms: number) {
  await new Promise<void>((res) => {
    setTimeout(() => res(), ms);
  });
}
