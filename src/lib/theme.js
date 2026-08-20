// 산책자들 팔레트 — 종이/잉크/등불(앰버). 섹션 구분은 sage(독서)·plum(시사)
export const c = {
  paper: "#FBF9F3",
  card: "#FFFFFF",
  ink: "#26303B",
  inkSoft: "#5B6976",
  faint: "#8A94A0",
  line: "#E7E0D2",
  lineSoft: "#F0EBDF",
  amber: "#B0791F",
  amberSoft: "#F3E9D2",
  sage: "#5E7A63",
  sageSoft: "#E4ECE3",
  plum: "#7E5B6E",
  plumSoft: "#EFE2EA",
  agree: "#5E7A63",
  oppose: "#A6674C",
  neutral: "#98928A",
};

// 새 회원 아바타 색을 이 중에서 골라 줍니다.
export const TINTS = [
  "#B0791F", "#5E7A63", "#7E5B6E", "#4F6D8C",
  "#A6674C", "#6E7A4F", "#8C5B6E", "#4F7A78",
];

export const pickTint = () => TINTS[Math.floor(Math.random() * TINTS.length)];
