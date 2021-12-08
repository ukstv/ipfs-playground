import * as IPFS from "ipfs";
import * as uint8arrays from "uint8arrays";
import { CarReader, CarWriter } from "@ipld/car";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import * as fs from "fs";

async function main() {
  const ipfs = await IPFS.create();
  const cid = await ipfs.dag.put({ hello: "world" });
  const outIter = ipfs.dag.export(cid);
  let buf = new Uint8Array([]);
  for await (let b of outIter) {
    buf = uint8arrays.concat([buf, b]);
  }
  // console.log("done", buf);
  const block = await ipfs.block.get(cid);
  const { writer, out } = await CarWriter.create([cid]);
  const writeStream = Readable.from(out).pipe(
    fs.createWriteStream("example.car")
  );
  // store a new block, creates a new file entry in the CAR archive
  await writer.put({ cid, bytes: block });
  await writer.close();
  await finished(writeStream)

  // const iterator = out[Symbol.asyncIterator]()
  // console.log('0', await iterator.next())
  // console.log('1', await iterator.next())
  // console.log('2', await iterator.next())
  // console.log('3', await iterator.next())
}

main();
