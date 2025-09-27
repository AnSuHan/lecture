import React, { useEffect, useState } from "react";
import Web3 from "web3"; // npm install web3
import abi from "../abi.json"; // abi.json이 src에 위치해야 import 가능

const CONTRACT_ADDRESS = "0xea8e4d6506F105968863f0102d496497Af5D81E0"; // 실제 배포된 컨트랙트 주소로 변경하세요

export default function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [ipfsHash, setIpfsHash] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(abi, CONTRACT_ADDRESS);
          setContract(contractInstance);

          // 예: 컨트랙트 잔액 조회
          const balanceWei = await web3Instance.eth.getBalance(CONTRACT_ADDRESS);
          const balanceEther = web3Instance.utils.fromWei(balanceWei, "ether");
          setBalance(balanceEther);
        } catch (error) {
          setMessage(`이더리움 연결 실패: ${error.message}`);
        }
      } else {
        setMessage("메타마스크(또는 이더리움 지갑)를 설치하세요.");
      }
    }
    init();
  }, []);

  const handleAddItem = async () => {
    if (!contract) {
      setMessage("컨트랙트 로드 중입니다...");
      return;
    }
    try {
      await contract.methods
        .addItem(ipfsHash, verificationCode)
        .send({ from: account });
      setMessage("자료 등록 성공!");
      setIpfsHash("");
      setVerificationCode("");
    } catch (error) {
      setMessage(`오류 발생: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>스마트 컨트랙트 대여 시스템</h1>
      <p><strong>연결 계정:</strong> {account ?? "연결 대기 중"}</p>
      <p><strong>컨트랙트 잔액:</strong> {balance} ETH</p>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="IPFS 해시 입력"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="검증 코드 입력"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem" }}
        />
        <button onClick={handleAddItem} style={{ padding: "0.5rem 1rem" }}>
          자료 등록
        </button>
      </div>

      <p>{message}</p>
    </div>
  );
}
