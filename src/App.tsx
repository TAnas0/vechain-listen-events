import "antd/dist/antd.css";
import Connex from "@vechain/connex";
import { ethers } from "@vechain/ethers";
import { useState, useEffect } from "react";
import { Row, Col, Input, Table } from "antd";

const connex = new Connex({
  node: "https://mainnet.veblocks.net",
  network: "main"
});

const ABI = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "_from",
      type: "address"
    },
    {
      indexed: true,
      name: "_to",
      type: "address"
    },
    {
      indexed: false,
      name: "_value",
      type: "uint256"
    }
  ],
  name: "Transfer",
  type: "event"
};
const CONTRACT_ADDRESS = "0x0000000000000000000000000000456E65726779";

export default function App() {
  const [transfers, setTransfers] = useState([]);
  const [address, setAddress] = useState(
    "0x0000000000000000000000000000456E65726779"
  );

  async function getHistoryFor(address) {
    try {
      const event = connex.thor.account(CONTRACT_ADDRESS).event(ABI);
      const logs = await event
        .filter([{ _to: address }, { _from: address }])
        .order("desc")
        .apply(0, 20);
      const transfers = logs.map(({ decoded, meta }) => ({
        ...decoded,
        meta
      }));
      setTransfers(transfers);
    } catch (err) {
      setTransfers([]);
      console.log(err);
    }
  }

  useEffect(() => {
    getHistoryFor(address);
  }, [address]);

  return (
    <Row gutter={[32, 32]}>
      <Col span={24} align="center">
        <h3>Last VTHO transfers of a single address</h3>
        <Input
          onChange={(e) => setAddress(e.target.value)}
          value={address}
          placeholder="0x04Ad3f13050cc766169433062BcDbB367B616986"
        />
      </Col>
      <Col span={24}>
        <Table dataSource={transfers} pagination={false}>
          <Table.Column
            title="Time"
            dataIndex={["meta", "blockTimestamp"]}
            render={(ts) => new Date(ts * 1000).toISOString()}
          />
          <Table.Column title="From" dataIndex="_from" />
          <Table.Column title="To" dataIndex="_to" />
          <Table.Column
            title="Amount"
            dataIndex="_value"
            align="right"
            render={(value) => ethers.utils.formatEther(value)}
          />
          <Table.Column title="Transaction Id" dataIndex={["meta", "txID"]} />
        </Table>
      </Col>
    </Row>
  );
}
