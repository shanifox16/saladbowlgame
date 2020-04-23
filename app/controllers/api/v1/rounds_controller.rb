class Api::V1::RoundsController < ApiController
  def index
    render json: Round.first.number
  end

  def update
    round = Round.first
    if round.number == 0
      round.number = 1
    elsif round.number == 1
      round.number = 2
    elsif round.number == 2
      round.number = 3
    elsif round.number == 3
      round.number = 4
    end

    if round.save
      render json: round
    else
      render json: {error: "Could not change the round - oops"}
    end
  end
end
