"use client";

import { FormEvent, useState } from "react";
import { findProhibitedWord } from "@/utils/prohibitedText";

const initialProfile = {
  nickname: "나눔구매자",
  phone: "",
  recipientName: "",
  postalCode: "",
  address: "",
  detailAddress: "",
  deliveryMemo: "",
};

const unavailableNicknames = new Set([
  "관리자",
  "운영자",
  "DropDeal",
  "구매자 데모",
  "승인 판매자 데모",
]);

export default function MyProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [checkedNickname, setCheckedNickname] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("닉네임 저장 전 중복 확인이 필요합니다.");

  const field = (key: keyof typeof profile) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSaved(false);
    if (key === "nickname") {
      setCheckedNickname("");
      setNicknameMessage("닉네임이 변경되었습니다. 중복 확인을 다시 진행해주세요.");
    }
    setProfile((current) => ({ ...current, [key]: event.target.value }));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (findProhibitedWord(Object.values(profile))) {
      setNicknameMessage("입력한 정보에 비속어, 운영진 사칭 등 사용할 수 없는 단어가 포함되어 있습니다.");
      return;
    }
    if (checkedNickname !== profile.nickname.trim()) {
      setNicknameMessage("닉네임 중복 확인을 완료해야 저장할 수 있습니다.");
      return;
    }
    localStorage.setItem("dropdeal_profile", JSON.stringify(profile));
    setSaved(true);
  };

  const checkNickname = () => {
    const nickname = profile.nickname.trim();

    if (!nickname) {
      setCheckedNickname("");
      setNicknameMessage("닉네임을 입력해주세요.");
      return;
    }

    if (findProhibitedWord([nickname])) {
      setCheckedNickname("");
      setNicknameMessage("비속어, 운영진 사칭 등 사용할 수 없는 단어가 포함되어 있습니다.");
      return;
    }

    if (unavailableNicknames.has(nickname)) {
      setCheckedNickname("");
      setNicknameMessage("이미 사용 중이거나 사용할 수 없는 닉네임입니다.");
      return;
    }

    setProfile((current) => ({ ...current, nickname }));
    setCheckedNickname(nickname);
    setNicknameMessage("사용 가능한 닉네임입니다.");
  };

  const load = () => {
    const savedProfile = localStorage.getItem("dropdeal_profile");
    if (!savedProfile) return;
    try {
      setProfile({ ...initialProfile, ...JSON.parse(savedProfile) });
      setCheckedNickname("");
      setNicknameMessage("저장된 닉네임을 사용하려면 중복 확인을 다시 진행해주세요.");
      setSaved(true);
    } catch {
      localStorage.removeItem("dropdeal_profile");
    }
  };

  return (
    <div className="shell section">
      <span className="eyebrow">My profile</span>
      <h1 className="page-title">내 정보 관리</h1>
      <p className="page-lead">닉네임과 결제 시 사용할 기본 배송지를 등록하고 수정할 수 있습니다.</p>
      <button className="btn btn-soft" style={{ marginTop: 16 }} type="button" onClick={load}>저장된 정보 불러오기</button>

      <form className="content-grid" style={{ marginTop: 28, alignItems: "start" }} onSubmit={save}>
        <div className="panel">
          <h3>나의 정보</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label>닉네임</label>
              <div className="nickname-check-row">
                <input className="field" value={profile.nickname} onChange={field("nickname")} required />
                <button className="btn btn-soft" type="button" onClick={checkNickname}>중복 확인</button>
              </div>
              <small className="auto-policy-help">{nicknameMessage}</small>
              <small className="auto-policy-help">문자 종류와 길이 제한은 없으며, 중복 닉네임과 금칙어만 사용할 수 없습니다.</small>
            </div>
            <div className="form-group full">
              <label>연락처</label>
              <input className="field" value={profile.phone} onChange={field("phone")} placeholder="010-0000-0000" required />
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>기본 배송지 등록</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label>받는 분</label>
              <input className="field" value={profile.recipientName} onChange={field("recipientName")} required />
            </div>
            <div className="form-group">
              <label>우편번호</label>
              <input className="field" value={profile.postalCode} onChange={field("postalCode")} required />
            </div>
            <div className="form-group">
              <label>기본 주소</label>
              <input className="field" value={profile.address} onChange={field("address")} placeholder="도로명 주소" required />
            </div>
            <div className="form-group full">
              <label>상세 주소</label>
              <input className="field" value={profile.detailAddress} onChange={field("detailAddress")} required />
            </div>
            <div className="form-group full">
              <label>기본 배송 메모</label>
              <input className="field" value={profile.deliveryMemo} onChange={field("deliveryMemo")} placeholder="문 앞에 놓아주세요." />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} type="submit" disabled={checkedNickname !== profile.nickname.trim()}>
            {saved ? "저장 완료" : "내 정보와 배송지 저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
