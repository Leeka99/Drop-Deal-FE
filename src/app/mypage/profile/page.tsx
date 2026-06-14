"use client";

import { FormEvent, useState } from "react";

const initialProfile = {
  nickname: "DropDeal 구매자",
  phone: "",
  recipientName: "",
  postalCode: "",
  address: "",
  detailAddress: "",
  deliveryMemo: "",
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  const field = (key: keyof typeof profile) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [key]: event.target.value }));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("dropdeal_profile", JSON.stringify(profile));
    setSaved(true);
  };

  const load = () => {
    const savedProfile = localStorage.getItem("dropdeal_profile");
    if (!savedProfile) return;
    try {
      setProfile({ ...initialProfile, ...JSON.parse(savedProfile) });
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
              <input className="field" value={profile.nickname} onChange={field("nickname")} maxLength={30} required />
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
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} type="submit">
            {saved ? "저장 완료" : "내 정보와 배송지 저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
