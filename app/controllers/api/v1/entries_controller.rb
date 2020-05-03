class Api::V1::EntriesController < ApiController
  def index
    current_game = Game.find_by(url: params["game_id"])
    current_entries = []
    current_round = current_game.round
    entries = current_game.entries
    entries.each do |entry|
      if current_round == 3
        if entry["round_three_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      elsif current_round == 2
        if entry["round_two_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      else
        if entry["round_one_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      end
    end

    render json: current_entries
  end

  def create
    current_game = Game.find_by(url: params["game_id"])
    entries = []
    entryOne = Entry.new(name: params["entryOne"])
    entryTwo = Entry.new(name: params["entryTwo"])
    entryThree = Entry.new(name: params["entryThree"])
    entryFour = Entry.new(name: params["entryFour"])
    entryFive = Entry.new(name: params["entryFive"])
    entryOne.game = current_game
    entryTwo.game = current_game
    entryThree.game = current_game
    entryFour.game = current_game
    entryFive.game = current_game

    if entryOne.save
      entries.push(entryOne)
    end
    if entryTwo.save
      entries.push(entryTwo)
    end
    if entryThree.save
      entries.push(entryThree)
    end
    if entryFour.save
      entries.push(entryFour)
    end
    if entryFive.save
      entries.push(entryFive)
    end

    if entries.length > 0
      render json: entries
    else
      render json: {
        errors: entryOne.errors.messages,
        fields: {
          entryOne: entryOne,
          entryTwo: entryTwo,
          entryThree: entryThree,
          entryFour: entryFour,
          entryFive: entryFive,
        }
      }
    end
  end

  def update
    current_game = Game.find_by(url: params["game_id"])
    entry = Entry.find(params[:id])
    current_round = current_game.round
    if current_round == 3
      entry.round_three_is_complete = true
      entry.round_three_winner = current_game.current_team
    elsif current_round == 2
      entry.round_two_is_complete = true
      entry.round_two_winner = current_game.current_team
    elsif current_round == 1
      entry.round_one_is_complete = true
      entry.round_one_winner = current_game.current_team
    end

    if entry.save
      render json: entry
    else
      render json: {error: "Could not update your correct entry"}
    end
  end
end
