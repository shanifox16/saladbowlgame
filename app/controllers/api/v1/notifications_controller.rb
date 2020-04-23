class Api::V1::NotificationsController < ApiController
  def index
    red_score_round_one = Entry.where(round_one_winner: "Red")
    red_score_round_two = Entry.where(round_two_winner: "Red")
    red_score_round_three = Entry.where(round_three_winner: "Red")
    red_score_total = red_score_round_one.length + red_score_round_two.length + red_score_round_three.length
    blue_score_round_one = Entry.where(round_one_winner: "Blue")
    blue_score_round_two = Entry.where(round_two_winner: "Blue")
    blue_score_round_three = Entry.where(round_three_winner: "Blue")
    blue_score_total = blue_score_round_one.length + blue_score_round_two.length + blue_score_round_three.length
    current_round = Round.first.number
    entries_left_in_round = 0
    if current_round == 1 || current_round == 0
      entries_left_in_round = Entry.where(round_one_is_complete: false).length
    elsif current_round == 2
      entries_left_in_round = Entry.where(round_two_is_complete: false).length
    elsif current_round == 3
      entries_left_in_round = Entry.where(round_three_is_complete: false).length
    end

    render json: {
      red_score_round_one: red_score_round_one,
      red_score_round_two: red_score_round_two,
      red_score_round_three: red_score_round_three,
      red_score_total: red_score_total,
      blue_score_round_one: blue_score_round_one,
      blue_score_round_two: blue_score_round_two,
      blue_score_round_three: blue_score_round_three,
      blue_score_total: blue_score_total,
      entries_left_in_round: entries_left_in_round,
      current_team: Team.first.name,
      current_round: current_round
    }
  end

  def show
    if params[:id] == "reset"
      all_entries = Entry.all
      round = Round.first

      all_entries.delete_all
      round.number = 0
      round.save

      render json: {success: "Game has been reset"}
    end
  end
end
