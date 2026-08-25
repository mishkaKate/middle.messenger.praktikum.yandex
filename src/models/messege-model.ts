export type Messege = {
  messege: string
}

export function sendMessege(messege: Messege) {
  console.log(`send messege: ${messege.messege}`);
}
