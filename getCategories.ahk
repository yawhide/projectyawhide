#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
SetTitleMatchMode 2
n = 1
store = https://www.sobeys.com/en/stores/
nowTime = %A_NowUTC%
FileCreateDir, %A_ScriptDir%\sobeyPart\%nowTime%
flyerUrl = https://www.sobeys.com/en/flyer
flyerPage = https://www.sobeys.com/en/flyer?&page=
page = 1
bakery = 49
beverage = 56
boxedMeats = 65
candy = 62
dairy = 61
deli = 48
floral = 54
grocery = 51
household = 58
meat = 43
pet = 59
produce = 45
seafood = 44
spread = 57
arr := Array(49, 56, 65, 62, 61, 48, 54, 51, 58, 43, 59, 45, 44, 57)
categUrlPart1 := "https://www.sobeys.com/en/flyer?page="
categUrlPart2 := "&products%5Bdepartment_id%5D="
categUrlPart3 := "&products%5Bq%5D=&utf8=%E2%9C%93"
j = 1
; make j start at any number
wb := ComObjCreate("InternetExplorer.Application")
wb.Visible := True
foundx=-1
foundy=-1
CoordMode Pixel, Relative
loop 295
{
	;replace A_Index with j
	store2 = %store%%j%
	wb.Navigate(store2)
	while wb.busy or wb.ReadyState != 4
		Sleep, 10
	sleep, 100
	if foundx <= 1 || foundy <= 1
	{
		ImageSearch, foundx, foundy, 0, 0, A_ScreenWidth, A_ScreenHeight, %A_ScriptDir%\insidebuttno.png
	}
	sleep,100
	;MsgBox The icon was found at %foundx% x %foundy% .

	founda=-1
	foundb=-1
	fou = 0
	Click %foundx%, %foundy%
	sleep, 300
	while founda < 1 && foundb < 1
	{
		ImageSearch, founda, foundb, 0, 0, A_ScreenWidth, A_ScreenHeight, %A_ScriptDir%\uniqueafterclick.png
		sleep, 100
		if founda < 1 && foundb < 1
		{
			ImageSearch, founda, foundb, 0, 0, A_ScreenWidth, A_ScreenHeight, %A_ScriptDir%\notfound404.png
			sleep, 100
			if founda > 1 && foundb > 1
			{
				fou = 1
			}
		}
		;MsgBox %founda% %foundb%
	}
	;MsgBox %fou%
	if fou = 0
	{
		FileCreateDir, %A_ScriptDir%\sobeyPart\%nowTime%\%j%
		sleep, 100
		
		loop 14
		{
			arrIndex := arr[A_Index]
			urlPart2 := ""
			urlPart2 .= categUrlPart1 1 categUrlPart2 arr[A_Index] categUrlPart3
			;MsgBox, urlPart2 is:
			;MsgBox % urlPart2

		    wb.Navigate(urlPart2)
		    while wb.busy or wb.ReadyState != 4
				Sleep, 10

			gg := wb.Document.All.Tags("h6")[1].InnerText
			hh := StrSplit(gg, A_Space)
			first := hh[2]
			;MsgBox, first is:
			;MsgBox % first

			if first > 0
			{
				last := hh[4]
				div := last / first
				final := Ceil(div)
				;MsgBox, final is: 
				;MsgBox % final

				i := 1
				;MsgBox, i is: 
				;MsgBox % i

				while i <= final
				{
				    urltmp := ""
					urltmp .= categUrlPart1 i categUrlPart2 arrIndex categUrlPart3
				    wb.Navigate(urltmp)
				    ;MsgBox, urltmp is:
				    ;MsgBox % urltmp
				    while wb.busy or wb.ReadyState != 4
						Sleep, 10
					sleep, 100
					
					;MsgBox, arr index is:
					;MsgBox % arrIndex
					save = % wb.document.documentElement.outerHTML
					
					FileAppend, %save%, %A_ScriptDir%\sobeyPart\%nowTime%\%j%\%arrIndex%.html
					sleep, 100
					
				    i++
				}
			}
		}
	}
	j++
}

MsgBox done!