import React from "react"
import Enzyme, { mount } from "enzyme"
import Adapter from "enzyme-adapter-react-16"
import { BrowserRouter } from 'react-router-dom'
Enzyme.configure({ adapter: new Adapter() })

import MidgameScoreboard from "./MidgameScoreboard"

describe("MidgameScoreboard", () => {
  let wrapper, onClickMock

  beforeEach(() => {
    onClickMock = jest.fn()
    wrapper = mount(
      <BrowserRouter>
        <MidgameScoreboard
          currentTeam="Red"
          entriesLeftInRound={15}
          redScoreRoundOne={7}
          blueScoreRoundOne={8}
          redScoreRoundTwo={10}
          blueScoreRoundTwo={5}
          redScoreRoundThree={0}
          blueScoreRoundThree={0}
          redScoreTotal={17}
          blueScoreTotal={13}
          turnInProgress={true}
          secondsRemaining={54000}
          onTickFunction={onClickMock}
          scoreboardTime={54000}
          // timeFormat={<p>:42</p>}
          currentRound={3}
        />
      </BrowserRouter>
    )
  })

  it("renders the round 2 red score", () => {
    expect(wrapper.find("#red-round-two-score").text()).toBe("10")
  })

  it("renders the blue total score", () => {
    expect(wrapper.find("#blue-total-score").text()).toBe("13")
  })
})
