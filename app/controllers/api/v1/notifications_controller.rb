class Api::V1::NotificationsController < ApiController
  def index
    current_game = Game.find_by(url: params["game_id"])
    current_players = current_game.players
    blue_team_players = current_players.where(team: "Blue")
    red_team_players = current_players.where(team: "Red")
    current_entries = current_game.entries
    red_score_round_one = current_entries.where(round_one_winner: "Red")
    red_score_round_two = current_entries.where(round_two_winner: "Red")
    red_score_round_three = current_entries.where(round_three_winner: "Red")
    red_score_total = red_score_round_one.length + red_score_round_two.length + red_score_round_three.length
    blue_score_round_one = current_entries.where(round_one_winner: "Blue")
    blue_score_round_two = current_entries.where(round_two_winner: "Blue")
    blue_score_round_three = current_entries.where(round_three_winner: "Blue")
    blue_score_total = blue_score_round_one.length + blue_score_round_two.length + blue_score_round_three.length
    current_round = current_game.round
    entries_left_in_round = 0
    if current_round == 1 || current_round == 0
      entries_left_in_round = current_entries.where(round_one_is_complete: false).length
    elsif current_round == 2
      entries_left_in_round = current_entries.where(round_two_is_complete: false).length
    elsif current_round == 3
      entries_left_in_round = current_entries.where(round_three_is_complete: false).length
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
      total_entries: current_entries,
      current_team: current_game.current_team,
      current_round: current_round,
      blue_team_players: blue_team_players,
      red_team_players: red_team_players
    }
  end

  def show
    if params[:id] == "reset"
      current_game = Game.find_by(url: params["game_id"])
      all_entries = current_game.entries
      all_players = current_game.players

      all_entries.delete_all
      all_players.delete_all
      current_game.round = 0
      current_game.save

      render json: {success: "Game has been reset"}
    end
  end
end
